import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/services.storage.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { fullName, email, phone, oldPassword, newPassword } = req.body;

    if (email && email !== user.email) {
      const exists = await userModel.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

    if (req.file) {
      const uploaded = await uploadFile(req.file.buffer, uuid());
      user.avatar = uploaded.url;
    }

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required" });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const safeUser = await userModel.findById(user._id).select("-password");
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
