import express from "express";
import { fetchCoinByCreator, fetchCoinByToken, fetchCoins } from "../controller/coinController";

const coinRoutes = express.Router();

// User sign-in route
coinRoutes.get('/', async (req, res, next) => {
  try {
    await fetchCoins(req, res);
  } catch (error) {
    next(error);
  }
});

coinRoutes.get('/:token', async (req, res, next) => {
  try {
    await fetchCoinByToken(req, res);
  } catch (error) {
    next(error);
  }
})

// User profile update route
coinRoutes.get('/creator/:creator', async (req, res, next) => {
  try {
    await fetchCoinByCreator(req, res);
  } catch (error) {
    next(error);
  }
})

export default coinRoutes;
