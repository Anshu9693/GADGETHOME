const calculateCartTotals = (cart) => {
  let totalItems = 0;
  let totalPrice = 0;

  cart.items.forEach((item) => {
    totalItems += item.quantity;
    totalPrice += item.quantity * item.priceAtAddTime;
  });

  cart.totalItems = totalItems;
  cart.totalPrice = totalPrice;
};


import CartModel from "../models/cart.model.js";
import ProductModel from "../models/products.model.js";

// ✅ ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not available" });
    }

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      cart = await CartModel.create({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddTime: product.discountPrice || product.price,
      });
    }

    calculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET CART
export const getCart = async (req, res) => {
  try {
    const cart = await CartModel.findOne({ user: req.user._id })
      .populate("items.product");

    res.status(200).json({
      success: true,
      cart: cart || { items: [], totalItems: 0, totalPrice: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ UPDATE CART ITEM QUANTITY
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    calculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    calculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CLEAR ENTIRE CART
export const clearCart = async (req, res) => {
  try {
    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
    