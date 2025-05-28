import { Request, Response } from "express";
import ReplyModel from "../models/Reply";
import CoinModel from "../models/Coin";
import { io } from "../sockets";

// Get replies of the token
export const getReplyByToken = async (req: Request, res: Response) => {
    try {
        const coinID = req.params.coinID;
        const replies = await ReplyModel.find({coinID}).populate('creator')
        res.status(200).send(replies)
    } catch (error) {
        res.status(500).json("Failed fectching Replies")
    }
}

// Post reply
export const postReply = async (req: Request, res: Response) => {
    const { body } = req;
    try {
        const newReply = new ReplyModel(body);

        const reply = await newReply.save()
        const updatedMsg = await ReplyModel.findOne({ _id: reply._id }).populate('sender');
        const updatedCoin = await CoinModel.findByIdAndUpdate(
            body.coinId,
            {
                $inc: { reply: 1 },          // Increment the reply field by 1
            },
            {
                new: true                    // Return the updated document
            }
        );
        io?.emit("MessageUpdated", body.coinId, updatedMsg);

        return res.status(200).send(reply)
    } catch (err) {
        return res.status(400).json(err)
    }
}