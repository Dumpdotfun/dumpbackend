import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';

import userRoutes from "./routes/userRoutes";
import coinRoutes from "./routes/coinRoutes";
import chartRoutes from "./routes/chartRoutes";
import tokenTradeRoutes from "./routes/tokenTradeRoutes";
import replyRoutes from "./routes/replyRoutes";
import { listenerForEvents } from "./program/web3";
import { PORT } from "./config/constants";
import { socketio } from "./sockets/index";
import { connectionDB } from "./db/dbConnection";
import commentRoutes from './routes/comment.routes';
import solPriceRoutes from "./routes/solPriceRoutes";
import axios from "axios";
import SolPriceModel from "./models/SolPrice";
import agoraRoutes from './routes/agoraRoutes';

const app = express();

const whitelist = ["http://localhost:3000"];

const corsOptions = {
  origin: "*",
  credentials: false,
  sameSite: "none",
};

connectionDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


app.get("/", async (req: Request, res: Response) => {
  res.json("Success!!");
});

app.use('/user/', userRoutes);
app.use('/coin/', coinRoutes);
app.use('/tokenTrade/', tokenTradeRoutes);
app.use('/reply/', replyRoutes);
app.use('/chart/', chartRoutes);
app.use('/api/comments/', commentRoutes);
app.use('/solPrice', solPriceRoutes)
app.use('/agora', agoraRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dumpdotfun')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const fetchSolPrice = async () => {
  try {
    const response = await axios.get('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
    const solPriceData = response.data.data;
    const price = solPriceData['So11111111111111111111111111111111111111112'].price;
    await SolPriceModel.findOneAndUpdate(
      {},
      { solPrice: price },
      { upsert: true }
    );
  } catch (error) {
    console.log('Error fetching SOL price:', error);
  }
}
setInterval(fetchSolPrice, 120000);

export const server = app.listen(PORT, async () => {
  console.log(`server is listening on ${PORT}`);
  listenerForEvents();
  fetchSolPrice();
});
socketio(server);