// models/Coin.ts
import { required } from "joi";
import mongoose from "mongoose";

const solPriceSchema = new mongoose.Schema({
    solPrice: { type: Number, default: 0 }
});

const SolPriceModel = mongoose.model("solPriceModel", solPriceSchema);

export default SolPriceModel;