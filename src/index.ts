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
import livekitRoutes from './routes/livekitRoutes';

const app = express();

const whitelist = [
  "http://localhost:3000",
  "http://localhost:2000",
  "https://dump-fun-website-tunnel-647vanwr.devinapps.com",
  "https://dump-fun-app-tunnel-h19ncdwd.devinapps.com",
  "https://dump-fun-app-tunnel-9i3qn2sc.devinapps.com",
  "https://dump-front-end-production.up.railway.app"
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);
    
    if (origin.includes('localhost')) return callback(null, true);
    
    if (origin.includes('devinapps.com')) return callback(null, true);
    
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
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
app.use('/livekit', livekitRoutes);

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
    const response = await axios.get('https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112');
    const solPriceData = response.data['So11111111111111111111111111111111111111112'].usdPrice;
    const existingSolPrice = await SolPriceModel.findOne();
    if (!existingSolPrice) {
      const solPrice = new SolPriceModel({ solPrice: solPriceData });
      await solPrice.save();
    } else {
      existingSolPrice.solPrice = solPriceData;
      await existingSolPrice.save();
    }
    console.log('SOL price saved:', solPriceData);
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
