import express from "express";
import {
  getAllOrders,
  getOrderDetails,
  placeOrder,
  updateOrderStatus,
  cancelOrder,
  adminCancelOrder,
  markOrderPaid,
  getUserOrders,
} from "../controllers/order.controller.js";

import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";
import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

// Get all orders (Admin)
router.get("/admin/allorder", adminAuthMiddleware, getAllOrders);

// Update order status (Admin)
router.put(
  "/admin/updateorder/:orderId",
  adminAuthMiddleware,
  updateOrderStatus,
);

// Admin cancel order
router.put(
  "/admin/cancel/:orderId",
  adminAuthMiddleware,
  adminCancelOrder,
);

// Debug: mark order as paid (useful in local dev when webhooks are unavailable)
// NOTE: Unprotected route for convenience — remove or protect in production.
router.post("/mark-paid/:orderId", markOrderPaid);

/* ================= USER ROUTES ================= */

// Place order
router.post("/user/place-order", userAuthMiddleware, placeOrder);

// Get all orders of logged-in user (🔥 NEW)
router.get("/user", userAuthMiddleware, getUserOrders);

// Get single order details
router.get("/user/:orderId", userAuthMiddleware, getOrderDetails);

// Cancel order (🔥 NEW)
router.put("/user/cancel/:orderId", userAuthMiddleware, cancelOrder);

export default router;
