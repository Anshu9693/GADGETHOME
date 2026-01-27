import Stripe from "stripe";
import OrderModel from "../models/order.model.js";
import CartModel from "../models/cart.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const order = await OrderModel.findById(session.metadata.orderId);
    if (order) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      order.paymentIntentId = session.payment_intent;
      await order.save();

      // ✅ CLEAR CART AFTER SUCCESSFUL PAYMENT
      const cart = await CartModel.findOne({ user: order.user });
      if (cart) {
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();
      }
    }
  } else if (event.type === "charge.refunded") {
    // Handle refunds
    const charge = event.data.object;
    const order = await OrderModel.findOne({
      paymentIntentId: charge.payment_intent,
    });
    if (order) {
      order.paymentStatus = "Refund Pending";
      await order.save();
    }
  }

  res.json({ received: true });
};
