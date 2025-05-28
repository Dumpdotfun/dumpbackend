import express from "express";
import { getTradesByToken, postRaySignautureToToken, postSignautureToToken, getLastTrade } from "../controller/tokenTradeController";

const tokenTradeRoutes = express.Router();

tokenTradeRoutes.get("/lastrade", async (req, res, next) => {
  console.log("lastTrade-->")
  try {
    await getLastTrade(req, res);
  } catch (error) {
    next(error);
  }
});

tokenTradeRoutes.get("/:contractAddress", async (req, res, next) => {
  console.log("contractAddress-->")
  try {
    await getTradesByToken(req, res);
  } catch (error) {
    next(error);
  }
});

export default tokenTradeRoutes;
