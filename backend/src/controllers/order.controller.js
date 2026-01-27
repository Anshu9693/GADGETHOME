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

  // ✅ GET LOGGED-IN USER ORDERS
  export const getUserOrders = async (req, res) => {
    try {
      const orders = await OrderModel.find({ user: req.user._id })
        .populate("items.product", "name price images")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  // ✅ CANCEL ORDER (USER)
  export const cancelOrder = async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ❌ User can cancel only their own order
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      // ❌ Only Placed or Processing orders can be cancelled
      if (!["Placed", "Processing"].includes(order.orderStatus)) {
        return res.status(400).json({
          message: "Order cannot be cancelled at this stage",
        });
      }

      // ✅ Restore stock
      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      // ✅ Determine if order was already paid
      const wasPaid = order.paymentStatus === "Paid";

      // ✅ Determine new payment status based on current payment and method
      let newPaymentStatus = "Cancelled";
      if (order.paymentMethod === "STRIPE" && wasPaid) {
        newPaymentStatus = "Refund Pending";
      } else if (order.paymentMethod === "COD") {
        newPaymentStatus = "Cancelled";
      } else {
        newPaymentStatus = "Cancelled";
      }

      // ✅ Update order
      order.orderStatus = "Cancelled";
      order.paymentStatus = newPaymentStatus;

      await order.save();

      // ✅ Restore cart items only if order was NOT paid
      if (!wasPaid) {
        try {
          let cart = await CartModel.findOne({ user: order.user });
          
          // Create cart if doesn't exist
          if (!cart) {
            cart = await CartModel.create({ 
              user: order.user, 
              items: [] 
            });
          }

          // Add items back to cart
          for (const item of order.items) {
            const existingItem = cart.items.find(
              (cartItem) => cartItem.product.toString() === item.product.toString()
            );
            if (existingItem) {
              existingItem.quantity += item.quantity;
            } else {
              cart.items.push({
                product: item.product,
                quantity: item.quantity,
                priceAtAddTime: item.price,
              });
            }
          }

          // Recalculate totals
          let totalItems = 0;
          let totalPrice = 0;
          cart.items.forEach((item) => {
            totalItems += item.quantity;
            totalPrice += item.quantity * item.priceAtAddTime;
          });
          cart.totalItems = totalItems;
          cart.totalPrice = totalPrice;

          await cart.save();
        } catch (cartError) {
          console.error("Cart restoration error:", cartError);
          // Don't fail the entire cancellation if cart restoration fails
        }
      }

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
            order: await order
              .populate("items.product", "name price images")
              .execPopulate(),
      });
    } catch (error) {
      console.error("Cancel Order Error:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // ✅ CANCEL ORDER (ADMIN)
  export const adminCancelOrder = async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ❌ Only Placed or Processing orders can be cancelled
      if (!["Placed", "Processing"].includes(order.orderStatus)) {
        return res.status(400).json({
          message: "Order cannot be cancelled at this stage",
        });
      }

      // ✅ Restore stock
      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      // ✅ Determine if order was paid
      const wasPaid = order.paymentStatus === "Paid";
      let newPaymentStatus = "Cancelled";
      if (order.paymentMethod === "STRIPE" && wasPaid) {
        newPaymentStatus = "Refund Pending";
      }

      order.orderStatus = "Cancelled";
      order.paymentStatus = newPaymentStatus;

      await order.save();

      // Restore cart items only if not paid
      if (!wasPaid) {
        try {
          let cart = await CartModel.findOne({ user: order.user });
          if (!cart) {
            cart = await CartModel.create({ user: order.user, items: [] });
          }
          for (const item of order.items) {
            const existingItem = cart.items.find(
              (cartItem) => cartItem.product.toString() === item.product.toString()
            );
            if (existingItem) existingItem.quantity += item.quantity;
            else
              cart.items.push({
                product: item.product,
                quantity: item.quantity,
                priceAtAddTime: item.price,
              });
          }
          // recalc
          let totalItems = 0;
          let totalPrice = 0;
          cart.items.forEach((i) => {
            totalItems += i.quantity;
            totalPrice += i.quantity * i.priceAtAddTime;
          });
          cart.totalItems = totalItems;
          cart.totalPrice = totalPrice;
          await cart.save();
        } catch (e) {
          console.error("Admin cancel cart restore error:", e);
        }
      }

      res.status(200).json({
        success: true,
        message: "Order cancelled by admin",
        order: await order
          .populate("items.product", "name price images")
          .execPopulate(),
      });
    } catch (error) {
      console.error("Admin Cancel Error:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // ======= DEBUG / TEST: Mark order as Paid (useful for local testing) ======
  export const markOrderPaid = async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      // Mark paid and processing
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      await order.save();

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
        console.error("Failed clearing cart in markOrderPaid:", e);
      }

      const populated = await order
        .populate("items.product", "name price images")
        .execPopulate();

      res.status(200).json({ success: true, message: "Order marked Paid (debug)", order: populated });
    } catch (error) {
      console.error("markOrderPaid error:", error);
      res.status(500).json({ message: error.message });
    }
  };



  // ✅ PLACE ORDER (USER)


  /* ================= PLACE ORDER ================= */
  export const placeOrder = async (req, res) => {
    try {
      const userId = req.user._id;
      const { shippingAddress, paymentMethod } = req.body;

      // 1️⃣ Get cart
      const cart = await CartModel.findOne({ user: userId }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      let totalAmount = 0;

      const orderItems = cart.items.map((item) => {
        const price = item.product.discountPrice || item.product.price;
        totalAmount += price * item.quantity;

        return {
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0] || "/placeholder.png", // Safe image access
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
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
        orderStatus: "Placed",
      });

      // 3️⃣ Reduce stock
      for (const item of cart.items) {
        await ProductModel.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // 4️⃣ CLEAR CART ONLY AFTER PAYMENT SUCCESS
      // For STRIPE, cart will be cleared by webhook after payment succeeds
      // For COD, clear cart immediately
      if (paymentMethod === "COD") {
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();
      }

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
        cartCleared: paymentMethod === "COD", // 👈 only cleared for COD
      });
    } catch (error) {
      console.error("Place Order Error:", error); // Log detailed error
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
