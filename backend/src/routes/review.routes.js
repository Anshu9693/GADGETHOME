import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();

// USER
router.post("/add", userAuthMiddleware, addReview);
router.get("/product/:productId", getProductReviews);
router.put("/:reviewId", userAuthMiddleware, updateReview);
router.delete("/:reviewId", userAuthMiddleware, deleteReview);

export default router;
