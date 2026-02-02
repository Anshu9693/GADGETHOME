// controllers/analytics.controller.js
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/products.model.js";

export const getBestSellingProducts = async (req, res) => {
  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          orderStatus: { $ne: "Cancelled" },
          paymentStatus: "Paid",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }, // Top 10 best sellers
    ]);

    const productIds = result.map((i) => i._id);

    const products = await ProductModel.find({
      _id: { $in: productIds },
      isActive: true,
    });

    // Merge sold count with product
    const bestSelling = result.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item._id.toString()
      );
      return {
        product,
        totalSold: item.totalSold,
      };
    });

    res.status(200).json({
      success: true,
      bestSelling,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
