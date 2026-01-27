import express from "express";
import { createStripeSession, confirmStripeSession } from "../controllers/stripe.controller.js";
import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();

// Create session route (user authenticated)
router.post("/create-session", userAuthMiddleware, createStripeSession);

// Confirm session after redirect
// NOTE: this endpoint may be called after redirect from Stripe where cookies
// or sameSite flags can prevent auth cookies being sent. Accept unauthenticated
// calls here because the Stripe session contains `metadata.orderId` and we
// verify payment intent server-side before marking orders as paid.
router.post("/confirm", confirmStripeSession);

export default router;
