import { Request, Response } from "express";
import CoinModel from "../models/Coin";

// Get all coins info
export const fetchCoins = async (req: Request, res: Response) => {
    try {
        const coins = await CoinModel.find({}).populate("creator");
        // Send the coins if they exist
        return res.status(200).json(coins);
    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching coins:", error);

        // Send a 500 (Internal Server Error) response with a message
        return res.status(500).json({ message: "Failed fetching Coins" });
    }
}

// Get Coin by ID
export const getCoinByID = async (req: Request, res: Response) => {
    try {
        const coinId = req.params.id;
        const coin = await CoinModel.findById(coinId).populate('creator')
        return res.status(200).send(coin)
    } catch (error) {
        return res.status(500).json("Failed fetching coin by ID")
    }
}
// GEt coin by token
export const fetchCoinByToken = async (req: Request, res: Response) => {
    try {
        const token = req.params.token;
        const coin = await CoinModel.findOne({ token }).populate('creator')
        return res.status(200).send(coin)
    } catch (error) {
        return res.status(500).json("Failed fetching coin by token")
    }
}

// Get coins by Creator
export const fetchCoinByCreator = async (req: Request, res: Response) => {
    try {
        const creator = req.params.creator;
        const coins = await CoinModel.find({ creator }).populate('creator')
        return res.status(200).send(coins)
    } catch (error) {
        return res.status(500).json("Failed fetching coin by Creator")
    }
}