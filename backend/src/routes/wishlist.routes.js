import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controllers.js";

import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();

// USER WISHLIST ROUTES
router.post("/add", userAuthMiddleware, addToWishlist);
router.get("/", userAuthMiddleware, getWishlist);
router.delete("/remove/:productId", userAuthMiddleware, removeFromWishlist);

export default router;
