import express from "express";
import SolPriceModel from "../models/SolPrice";

const solPriceRoutes = express.Router();

// User sign-in route
solPriceRoutes.get('/', async (req, res, next) => {
    try {

        const price = await SolPriceModel.findOne();
        res.status(200).json(price.solPrice)
    } catch (error) {
        next(error);
    }
});

export default solPriceRoutes;
