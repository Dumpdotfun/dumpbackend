import express from "express";
import { logger } from "../sockets/logger";
import { fetchPriceChartData } from "../utils/chart";



const chartRoutes = express.Router();

// @route   GET /coin/
// @desc    Get all created coins
// @access  Public
chartRoutes.post('/:token', async (req, res) => {
  const { token } = req.params
  const { range, countBack } = req.body
  try {
    const data = await fetchPriceChartData(parseInt(range), token, parseInt(countBack));
    return res.status(200).send({ table: data });
  } catch (e) {
    console.error(e);
    return res.status(500).send({});
  }
})

export default chartRoutes;
