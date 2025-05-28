// models/Coin.ts
import mongoose from "mongoose";

const coinSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    description: { type: String },
    url: { type: String, requried: true },
    token: { type: String, unique: true, required: true },
    tokenSupply: { type: Number, required: true },
    tokenReserves: { type: Number, required: true },
    lamportReserves: { type: Number, required: true },
    progressMcap: { type: String, required: true },
    date: { type: Date, default: new Date() },
    bondingCurve: { type: Boolean, default: false },
    reply: { type: Number, default: 0 },
    website: { type: String, default: "" },
    twitter: { type: String, default: "" },
    telegram: { type: String, default: "" },
},
{
    timestamps: true,
} );

const CoinModel = mongoose.model("CoinModel", coinSchema);

export default CoinModel;