import { ComputeBudgetProgram, Connection, PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction, } from '@solana/web3.js';
import base58 from 'bs58';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { Pumpfun } from './pumpfun'
import idl from "./pumpfun.json"
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import * as anchor from '@coral-xyz/anchor';
import { clients, io } from '../sockets';
import { Metaplex } from '@metaplex-foundation/js';
import CoinStatus from '../models/TradeStatus';
import { ammProgram} from '../utils/constants';
import { NATIVE_MINT, createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import UserModel from '../models/User';
import CoinModel from '../models/Coin';
import TradeStatus from '../models/TradeStatus';
import { updateGlobalLastTrade } from "../controller/tokenTradeController";
import { BN } from 'bn.js';

require('dotenv').config();

export const commitmentLevel = "processed";
export const endpoint = process.env.PUBLIC_SOLANA_RPC || clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);

const privateKey = base58.decode(process.env.PRIVATE_KEY!);

export const pumpProgramInterface = JSON.parse(JSON.stringify(idl));

const adminKeypair = web3.Keypair.fromSecretKey(privateKey);
const adminWallet = new NodeWallet(adminKeypair);
const provider = new AnchorProvider(connection, adminWallet, {
  preflightCommitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(
  pumpProgramInterface,
  provider
) as Program<Pumpfun>;

const metaplex = Metaplex.make(connection);
let token: PublicKey;
// Function to handle `launchEvent`
const handleLaunchEvent = async (event: any, signature: string) => {
  console.log("Launch Event received:", event);
  try {
    const user = await UserModel.findOne({ wallet: event.creator })
    const token = await metaplex.nfts().findByMint({ mintAddress: event.mint });
    const tokenSupply = event.tokenSupply.toNumber() / 1e6;
    const tokenReserves = event.reserveToken.toNumber() / 1e6;
    const lamportReserves = event.reserveLamport.toNumber() / 1e9;
    const progressMcap = (tokenSupply * (lamportReserves / tokenReserves)).toFixed(4);
    const newCoin = new CoinModel({
      creator: user._id,
      name: token.name,
      ticker: token.symbol,
      description: token.json?.description,
      url: token.json?.image,
      token: event.mint,
      tokenSupply,
      tokenReserves,
      lamportReserves,
      progressMcap,
      bondingCurve: false,
      website: token.json?.website || "",
      twitter: token.json.twitter || "",
      telegram: token.json.telegram || ""
    })
    const response = await newCoin.save();
    const newTradeStatus = new TradeStatus({
      coinId: response._id,
      record: [
        {
          createdBy: response.creator,
          tokenAmount: 0,
          lamportAmount: 0,
          swapDirection: "CREATE",
          tx: signature,
          price: (lamportReserves / tokenReserves),
        }
      ]
    })
    await newTradeStatus.save();

    if (io != null) io.emit("TokenCreated", newCoin)
  } catch (error) {
    return "Token create failed"
  }
};

// Function to handle `swapEvent`
const handleSwapEvent = async (event: any, signature: string) => {
  console.log("Swap Event received:", event);
  try {
    const coin = await CoinModel.findOne({ token: event.mint.toString() });
    const user = await UserModel.findOne({ wallet: event.user });
    const tokenReserves = event.reserveToken.toNumber() / 1e6;
    const lamportReserves = event.reserveLamport.toNumber() / 1e9;

    const newTx = {
      createdBy: user?._id,
      swapDirection: event.direction == 0 ? "BUY" : "SELL",
      tokenAmount: event.direction == 0 ? event.amountOut.toNumber() / 1e6 : event.amountIn.toNumber() / 1e6,
      lamportAmount: event.direction == 1 ? event.amountOut.toNumber() / 1e9 : event.amountIn.toNumber() / 1e9,
      tx: signature,
      price: (lamportReserves / tokenReserves),
    }
    CoinStatus.findOne({ coinId: coin?._id })
      .then((coinStatus) => {
        coinStatus?.record.push(newTx);
        coinStatus?.save()
      })
    const tokenSupply = await CoinModel.findOne({ token: event.mint }).select('tokenSupply');
    const progressMcap = (tokenSupply.tokenSupply / tokenReserves * lamportReserves).toFixed(3);
    const updateCoin = await CoinModel.findOneAndUpdate(
      { token: event.mint },
      { tokenReserves, lamportReserves, progressMcap: parseFloat(progressMcap) },
      { new: true, runValidators: true })
    // coinKing();
    const newTrade = {
      creator: user.name,
      avatar: user.avatar,
      token: event.mint.toString(),
      name: coin.name,
      ticker: coin.ticker,
      url: coin.url,
      progressMcap,
      reply: coin.reply,
      action: event.direction == 0 ? "BUY" : "SELL",
      amount: event.direction == 1 ? event.amountOut.toNumber() / 1e9 : event.amountIn.toNumber() / 1e9,
      date: new Date(),
    }

    // Save to global last trade
    await updateGlobalLastTrade(newTrade);

    // Send both trade data and updated token data
    const tradeUpdateData = {
      trade: newTrade,
      tokenUpdate: {
        token: event.mint.toString(),
        tokenReserves,
        lamportReserves,
        progressMcap: parseFloat(progressMcap)
      }
    };

    if (io != null) io.emit("TradeUpdated", tradeUpdateData)
    if (clients.has(event.mint.toString())) {
      const clientList = clients.get(event.mint.toString());
      clientList.forEach((client) => {
        if (client.connected) {
          client.send(JSON.stringify({
            time: new Date(),
            token: event.mint.toString(),
            price: (lamportReserves / tokenReserves),
          }));
        }
      });
    }

  } catch (error) {
    return "Swap failed"
  }
};

// Function to handle `completeEvent`
const handleCompleteEvent = async (event: any, signature) => {
  console.log("Complete Event received:", event);
  await sleep(1000);
  await CoinModel.findOneAndUpdate(
    { token: event.mint },
    { bondingCurve: true },
    { new: true, runValidators: true })
  await handleMigrate(event.mint)
};

// Function to handle `withdrawEvent`
const handleWithdrawEvent = async (event: any, signature) => {
  console.log("Withdraw Event received:", event);
  // Token migrate to raydium
};

// Function to handle `migrateEvent`
const handleMigrateEvent = async (event: any, signature) => {
  console.log("Migrate Event received:", event);
};

let eventListenerConnected: boolean = false;

export const listenerForEvents = async () => {
  console.log("TeamWallet", adminWallet.publicKey.toString());

  if (eventListenerConnected == true) return;
  eventListenerConnected = true
  // Add listeners for each event
  const launchListenerId = program.addEventListener("launchEvent", (event, slot, signature) => { handleLaunchEvent(event, signature) });
  const swapListenerId = program.addEventListener("swapEvent", (event, slot, signature) => { handleSwapEvent(event, signature) });
  const completeListenerId = program.addEventListener("completeEvent", (event, slot, signature) => { handleCompleteEvent(event, signature) });
  const withdrawListenerId = program.addEventListener("withdrawEvent", (event, slot, signature) => { handleWithdrawEvent(event, signature) });
  const migrateListenerId = program.addEventListener("migrateEvent", (event, slot, signature) => { handleMigrateEvent(event, signature) });
  console.log("Listeners added with IDs:", {
    launch: launchListenerId,
    swap: swapListenerId,
    complete: completeListenerId,
    withdraw: withdrawListenerId,
    migrate: migrateListenerId,
  });
};

// Call the listener function to start listening for events
listenerForEvents().catch(err => {
  console.error("Error setting up listener:", err);
});

const handleMigrate = async (token: PublicKey) => {
  try {
    const configPda = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    )[0];
    const configAccount = await program.account.config.fetch(configPda);

    const index = 1;
    const indexBN = new BN(index)

    const bondingCurve = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding_curve"), token.toBytes()],
      program.programId
    )[0];
    const globalVault = PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      program.programId
    )[0];

    const pool = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        indexBN.toArrayLike(Buffer, "le", 2),
        globalVault.toBytes(),
        token.toBytes(),
        NATIVE_MINT.toBytes()
      ],
      ammProgram
    )[0];

    const teamAta = getAssociatedTokenAddressSync(token, adminWallet.publicKey);

    const poolBaseTokenAccountPDA = getAssociatedTokenAddressSync(
      token,
      pool,
      true
    );
    const poolQuoteTokenAccountPDA = getAssociatedTokenAddressSync(
      NATIVE_MINT,
      pool,
      true
    );

    const transaction = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        adminWallet.publicKey,
        teamAta,
        adminWallet.publicKey,
        token
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        adminWallet.publicKey,
        poolBaseTokenAccountPDA,
        pool,
        token
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        adminWallet.publicKey,
        poolQuoteTokenAccountPDA,
        pool,
        NATIVE_MINT,
      ),
    );
    const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 });
    const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 1000_000 });
    const transferFeeTx = await program.methods.transferFee()
      .accounts({
        coinMint: token,
        payer: adminWallet.publicKey,
        teamWallet: configAccount.teamWallet
      }).transaction();
    const migrateIx = await program.methods
      .migratePumpswap(index)
      .accounts({
        coinMint: token,
        payer: adminWallet.publicKey,
        pumpswapProgram: new PublicKey("pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"),
        teamWallet: adminWallet.publicKey,
        wsolMint: NATIVE_MINT
      })
      .instruction();
    transaction.add(updateCpIx, updateCuIx, transferFeeTx, migrateIx);
    transaction.feePayer = adminWallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const sig = await sendAndConfirmTransaction(
      connection, 
      transaction, 
      [adminKeypair], 
      { skipPreflight: true }
    )
  } catch (error) {
    console.log("Error in migrate:", error);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface CoinInfo {
  creator: string;
  name: string;
  ticker: string;
  url: string;
  description?: string;
  token: string;
  tokenReserves: number;
  lamportReserves: number;
  marketcap: number;
  presale?: number;
  decimals: number;
}

export type CoinInfoRequest = Omit<
  CoinInfo,
  "tokenReserves" | "lamportReserves" | "marketcap"
> & { tx: string; tokenReserves: number; lamportReserves: number };

export interface ResultType {
  tx: string;
  mint: string;
  user: string;
  swapDirection: number;
  lamportAmount: number;
  tokenAmount: number;
  tokenReserves: number;
  lamportReserves: number;
}
