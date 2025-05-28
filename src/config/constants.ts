import { DEVNET_PROGRAM_ID, MAINNET_PROGRAM_ID, TxVersion } from "@raydium-io/raydium-sdk";
import { retrieveEnvVariable } from "../utils/util";
import { Cluster, PublicKey } from "@solana/web3.js";

export const MONGODB_URI = retrieveEnvVariable("MONGODB_URI");
export const PINATA_GATEWAY_URL = retrieveEnvVariable("PINATA_GATEWAY_URL");
export const DEFAULT_IMG_HASH = retrieveEnvVariable("DEFAULT_IMG_HASH");

export const SIGN_IN_MSG = retrieveEnvVariable("SIGN_IN_MSG");
export const JWT_SECRET = retrieveEnvVariable("JWT_SECRET");
export const PORT = retrieveEnvVariable("PORT")


export const SEED_CONFIG = "config";
export const SEED_BONDING_CURVE = "bonding_curve";

export const TEST_NAME = "test spl token";
export const TEST_SYMBOL = "TEST";
export const TEST_URI ="https://ipfs.io/ipfs/QmWVzSC1ZTFiBYFiZZ6QivGUZ9awPJwqZECSFL1UD4gitC";
export const TEST_VIRTUAL_RESERVES = 2_000_000_000;
export const TEST_TOKEN_SUPPLY = 1_000_000_000_000;
export const TEST_DECIMALS = 6;
export const TEST_INIT_BONDING_CURVE = 95;

const cluster: Cluster = "devnet";

export const raydiumProgramId =
    cluster.toString() == "mainnet-beta" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;

export const ammProgram =
    cluster.toString() == "mainnet-beta"
        ? new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") // mainnet-beta
        : new PublicKey("HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8"); // devnet

export const marketProgram =
    cluster.toString() == "mainnet-beta"
        ? new PublicKey("srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX") // mainnet-beta
        : new PublicKey("EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"); // devnet

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