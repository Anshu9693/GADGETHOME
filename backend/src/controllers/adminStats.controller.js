import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

// ✅ GET TOTAL REVENUE
export const getTotalRevenue = async (req, res) => {
  try {
    const result = await OrderModel.aggregate([
      {
        $match: {
          orderStatus: "Delivered", // count only completed orders
          paymentStatus: "Paid",
          // ✅ EXCLUDE CANCELLED ORDERS
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET TOTAL USERS
export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();

    res.status(200).json({
      success: true,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
