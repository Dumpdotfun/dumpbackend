import { MAINNET_PROGRAM_ID, DEVNET_PROGRAM_ID, TxVersion } from "@raydium-io/raydium-sdk";
import { Cluster, PublicKey } from "@solana/web3.js";

export const SEED_CONFIG = "config";
export const SEED_BONDING_CURVE = "bonding_curve";

export const TEST_NAME = "test spl token";
export const TEST_SYMBOL = "TEST";
export const TEST_URI =
    "https://ipfs.io/ipfs/QmWVzSC1ZTFiBYFiZZ6QivGUZ9awPJwqZECSFL1UD4gitC";
export const TEST_VIRTUAL_RESERVES = 2_000_000_000;
export const TEST_TOKEN_SUPPLY = 1_000_000_000_000;
export const TEST_DECIMALS = 6;
export const TEST_INIT_BONDING_CURVE = 95;

const cluster: Cluster = "mainnet-beta";

export const raydiumProgramId =
    cluster.toString() == "mainnet-beta" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;

export const ammProgram = new PublicKey("pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA") // pumpswap program devnet && mainnet-beta
      
export const feeDestination =
    cluster.toString() == "mainnet-beta"
        ? new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5") // Mainnet
        : new PublicKey("3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"); // Devnet
export const TOKEN_LIST_QUERY_LIMIT = 50;
export const TOKEN_DECIMALS = 6;
export const TOKEN_RESERVES = 1_000_000_000_000_000;
export const LAMPORT_RESERVES = 1_000_000_000;
export const GLOBAL_VAULT = "global";

export const makeTxVersion = TxVersion.LEGACY; // LEGACY

export const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
export const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

// LiveKit credentials - store these in env variables for production
export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
export const LIVEKIT_URL = process.env.LIVEKIT_URL || '';

