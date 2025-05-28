// models/CoinStatus.ts
import mongoose from "mongoose";

const TradeStatusSchema = new mongoose.Schema({

  coinId: { type: mongoose.Schema.Types.ObjectId, ref: "CoinModel", required: true },
  record: [
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      time: { type: Date, default: Date.now },
      tokenAmount: { type: Number, required: true },
      lamportAmount: { type: Number, required: true },
      swapDirection: { type: String, required: true },
      price: { type: Number, required: true },
      tx: { type: String, required: true },
    },
  ],
});

const TradeStatus = mongoose.model("TradeStatus", TradeStatusSchema);

export default TradeStatus;
