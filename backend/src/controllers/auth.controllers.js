import userModel from "../models/user.model.js";
import adminModel from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
};

export const userSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {});

    return res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({
        success: true,
        message: "Signup successful",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const userLogout = (req, res) => {
  try {
    res
      .clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({});
  }
};

// ADMINS Controllers
export const adminSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await adminModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({
        success: true,
        message: "Signup successful",
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
        },
      });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin and include password for comparison
    const admin = await adminModel.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { userId: admin._id, role: "admin" },
      process.env.JWT_SECRET
    );

    // Set token in secure cookie
    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Admin login successful",
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: "admin",
        },
      });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const adminLogout = (req, res) => {
  try {
    res
      .clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" })
      .status(200)
      .json({ message: "Admin logout successful" });
  } catch (error) {
    console.error("Admin Logout Error:", error);
    return res.status(500).json({});
  }
};
