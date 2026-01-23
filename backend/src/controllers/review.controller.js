import ReviewModel from "../models/review.model.js";
import ProductModel from "../models/products.model.js";

const updateProductRating = async (productId) => {
  const reviews = await ReviewModel.find({ product: productId });

  const numReviews = reviews.length;
  const rating =
    numReviews === 0
      ? 0
      : reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews;

  await ProductModel.findByIdAndUpdate(productId, {
    numReviews,
    rating: rating.toFixed(1),
  });
};


export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const review = await ReviewModel.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }
    res.status(500).json({ message: error.message });
  }
};


export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await ReviewModel.find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await ReviewModel.findOne({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();
    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: "Review updated",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
