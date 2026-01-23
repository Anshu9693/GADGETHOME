import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();

router.post("/add", userAuthMiddleware, addToCart);
router.get("/getItems", userAuthMiddleware, getCart);
router.put("/updateItems", userAuthMiddleware, updateCartQuantity);
router.delete("/remove/:productId", userAuthMiddleware, removeFromCart);

export default router;
