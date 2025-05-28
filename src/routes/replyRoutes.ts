import express from "express";
import Reply from "../models/Reply";
import { io } from "../sockets";
import Coin from "../models/Coin";
import { getReplyByToken, postReply } from "../controller/replyController";

const replyRoutes = express.Router();

// Get replies of token
replyRoutes.get('/:coinID',async (req, res, next) => {
     try {
        await getReplyByToken(req, res);
      } catch (error) {
        next(error);
      }
})

// Post reply
replyRoutes.post('/', async (req, res, next) => {
    try {
        await postReply(req, res);
      } catch (error) {
        next(error);
      }
})

export default replyRoutes;