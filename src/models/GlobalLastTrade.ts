import mongoose from "mongoose";

const GlobalLastTradeSchema = new mongoose.Schema({
    creator: { type: String, required: true },
    avatar: { type: String, required: true },
    token: { type: String, required: true },
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    url: { type: String, required: true },
    progressMcap: { type: Number, required: true },
    reply: { type: Number, required: true },
    action: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});



const GlobalLastTrade = mongoose.model("GlobalLastTrade", GlobalLastTradeSchema);

export default GlobalLastTrade; 