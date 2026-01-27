import WishlistModel from "../models/wishlist.model.js";
import ProductModel from "../models/products.model.js";

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const productExists = await ProductModel.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await WishlistModel.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await WishlistModel.create({
        user: userId,
        products: [productId],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId
      );

      if (alreadyExists) {
        return res.status(400).json({
          message: "Product already in wishlist",
        });
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET USER WISHLIST ================= */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await WishlistModel.findOne({
      user: req.user._id,
    }).populate("products");

    res.status(200).json({
      success: true,
      products: wishlist ? wishlist.products : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await WishlistModel.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
