import { Request, Response } from "express";
import TradeStatus from "../models/TradeStatus";
import CoinModel from "../models/Coin";
import UserModel from "../models/User";
import GlobalLastTrade from "../models/GlobalLastTrade";
import { sol } from "@metaplex-foundation/js";
import { Types } from "mongoose";

interface PopulatedUser {
    _id: Types.ObjectId;
    wallet: string;
    avatar: string;
}

interface TradeRecord {
    createdBy: PopulatedUser;
    time: Date;
    tokenAmount: number;
    lamportAmount: number;
    swapDirection: string;
    price: number;
    tx: string;
}

// Get replies of the token
export const getTradesByToken = async (req: Request, res: Response) => {
    const contractAddress = req.params.contractAddress;
    const coinId = await CoinModel.findOne({ token: contractAddress }).select(`_id`)
    if (!coinId) return res.status(404).send("Coin id not found");
    try {
        const coinTrade = await TradeStatus.findOne({ coinId: coinId })
            .populate("record.createdBy")
            .select("record")
        if (!coinTrade) return res.status(404).send("coin status not found");
        res.status(200).send(coinTrade.record);
    } catch (error) {
        res.status(500).send(error);
    }
}

export const postSignautureToToken = async (req: Request, res: Response) => {
    try {
        const { signature, token, user } = req.body;
        const coinId = await CoinModel.findOne({ token }).select('_id');
        if (!coinId) {
            return res.status(404).json({ message: "Coin not found." });
        }
        const createdBy = await UserModel.findOne({ wallet: user }).select('_id');
        if (!createdBy) {
            return res.status(404).json({ message: "User not found." });
        }
        const updatedCoinStatus = await TradeStatus.updateMany(
            { coinId: coinId, "record.createdBy": createdBy, "record.tx": "txId" }, // Match criteria
            { $set: { "record.$[elem].tx": signature } }, // Update the tx field in all matched subdocuments
            {
                arrayFilters: [{ "elem.tx": "txId" }], // Apply the filter to specific array elements
                new: true, // Optional: MongoDB ignores `new` with `updateMany`
            }
        );

        res.status(200).json({ message: "Transaction updated successfully.", updatedCoinStatus });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export const postRaySignautureToToken = async (req: Request, res: Response) => {
    try {
        const { signature, token, user, amount, action } = req.body;
        const userId = await UserModel.findOne({ wallet: user }).select('_id');
        const coinId = await CoinModel.findOne({ token }).select('_id');

        const newTx = {
            createdBy: userId,
            swapDirection: action,
            tokenAmount: action == "sell" ? amount : 0,
            lamportAmount: action == "buy" ? amount : 0,
            tx: signature,
            price: 0,
        };
        TradeStatus.findOne({ coinId })
            .then((coinStatus) => {
                coinStatus?.record.push(newTx);
                coinStatus?.save()
            })
        res.status(200).json({ message: "Transaction updated successfully." });
    } catch (error) {

    }
}

// Get the last trade
export const getLastTrade = async (req: Request, res: Response) => {
    console.log("lastTrade-->")
    try {
        // First try to get from global last trade
        const globalLastTrade = await GlobalLastTrade.findOne().sort({ createdAt: -1 });
        if (globalLastTrade) {
            return res.status(200).send(globalLastTrade);
        }

        // If no global last trade, get from trade history
        const lastTrade = await TradeStatus.findOne()
            .sort({ 'record.time': -1 })
            .populate<{ record: TradeRecord[] }>({
                path: 'record.createdBy',
                select: 'wallet avatar'
            })
            .select('record')
            .limit(1);

        if (!lastTrade || !lastTrade.record || lastTrade.record.length === 0) {
            return res.status(404).send("No trades found");
        }

        const latestRecord = lastTrade.record[lastTrade.record.length - 1];
        const coin = await CoinModel.findById(lastTrade.coinId);
        
        if (!coin || !latestRecord.createdBy) {
            return res.status(404).send("Associated data not found");
        }

        const formattedTrade = {
            creator: latestRecord.createdBy.wallet,
            avatar: latestRecord.createdBy.avatar,
            token: coin.token,
            name: coin.name,
            ticker: coin.ticker,
            url: coin.url,
            progressMcap: coin.progressMcap,
            reply: coin.reply,
            action: latestRecord.swapDirection,
            amount: latestRecord.lamportAmount,
            date: latestRecord.time
        };

        // Save to global last trade
        await GlobalLastTrade.findOneAndUpdate(
            {},
            formattedTrade,
            { upsert: true, new: true }
        );

        res.status(200).send(formattedTrade);
    } catch (error) {
        console.error("Error fetching last trade:", error);
        res.status(500).send(error);
    }
}

// Update global last trade when a new trade occurs
export const updateGlobalLastTrade = async (tradeData: any) => {
    try {
        await GlobalLastTrade.findOneAndUpdate(
            {},
            tradeData,
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Error updating global last trade:", error);
    }
}
