import Stripe from "stripe";
import OrderModel from "../models/order.model.js";
import CartModel from "../models/cart.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${frontendUrl}/user/myorders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/user/checkout`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Confirm session (used when frontend returns with session_id)
export const confirmStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });

    // Retrieve session and expand payment_intent for status
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const orderId = session.metadata?.orderId;
    if (!orderId) return res.status(400).json({ message: "Invalid session metadata" });

    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // If payment_intent is present, ensure it succeeded
    const paymentIntentId = session.payment_intent?.id || session.payment_intent;
    let paymentSucceeded = false;

    if (session.payment_status === "paid") paymentSucceeded = true;

    if (!paymentSucceeded && paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi && pi.status === "succeeded") paymentSucceeded = true;
      } catch (e) {
        console.error("Failed to fetch payment intent:", e);
      }
    }

    if (paymentSucceeded) {
      // avoid double-updating
      if (order.paymentStatus !== "Paid") {
        order.paymentStatus = "Paid";
        order.orderStatus = "Processing";
        order.paymentIntentId = paymentIntentId;
        await order.save();
      }

      // clear user's cart
      try {
        const cart = await CartModel.findOne({ user: order.user });
        if (cart) {
          cart.items = [];
          cart.totalItems = 0;
          cart.totalPrice = 0;
          await cart.save();
        }
      } catch (e) {
        console.error("Failed to clear cart after confirm:", e);
      }

      const populated = await order.populate("items.product", "name price images");
      return res.status(200).json({ success: true, message: "Payment confirmed", order: populated });
    }

    return res.status(400).json({ message: "Payment not completed" });
  } catch (error) {
    console.error("Confirm session error:", error);
    res.status(500).json({ message: error.message });
  }
};
