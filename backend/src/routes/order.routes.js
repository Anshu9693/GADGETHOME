import express from "express";
import {
  getAllOrders,
  getOrderDetails,
  placeOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";
import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";

const router = express.Router();

// ---------- ADMIN ----------
router.get("/admin/allorder", adminAuthMiddleware, getAllOrders);
router.put("/admin/updateorder/:orderId", adminAuthMiddleware, updateOrderStatus);

// ---------- USER ----------
router.post("/user/place-order", userAuthMiddleware, placeOrder);
router.get("/user/:orderId", userAuthMiddleware, getOrderDetails);

export default router;
