// routes/analytics.routes.js
import express from "express";
import { getBestSellingProducts } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/best-selling", getBestSellingProducts);

export default router;
