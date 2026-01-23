import OrderModel from "../models/order.model.js";
import CartModel from "../models/cart.model.js";
import ProductModel from "../models/products.model.js";

// ✅ GET ALL ORDERS (ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("user", "fullName email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ORDER DETAILS
export const getOrderDetails = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.orderId)
      .populate("user", "fullName email")
      .populate("items.product", "name price images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // USER can only see own order
    if (req.user && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ PLACE ORDER (USER)
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    // 1️⃣ Get user's cart
    const cart = await CartModel.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    const orderItems = cart.items.map((item) => {
      const price =
        item.product.discountPrice || item.product.price;

      totalAmount += price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0],
        price,
        quantity: item.quantity,
      };
    });

    // 2️⃣ Create order
    const order = await OrderModel.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Placed",
    });

    // 3️⃣ Reduce stock
    for (const item of cart.items) {
      await ProductModel.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // 4️⃣ Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ UPDATE ORDER STATUS (ADMIN)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await OrderModel.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
