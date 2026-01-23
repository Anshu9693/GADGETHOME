import jwt from "jsonwebtoken";
import AdminModel from "../models/admin.model.js";

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies.token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = req.cookies.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const admin = await AdminModel.findById(decoded.userId).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
