import bcrypt from "bcrypt";
import AdminModel from "../models/admin.model.js";
import { uploadFile } from "../services/services.storage.js";
import { v4 as uuid } from "uuid";

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.admin._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json({ success: true, admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.admin._id).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { fullName, email, phone, oldPassword, newPassword } = req.body;

    if (email && email !== admin.email) {
      const exists = await AdminModel.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      admin.email = email;
    }

    if (fullName) admin.fullName = fullName;
    if (phone) admin.phone = phone;

    if (req.file) {
      const uploaded = await uploadFile(req.file.buffer, uuid());
      admin.avatar = uploaded.url;
    }

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required" });
      }
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    const safeAdmin = await AdminModel.findById(admin._id).select("-password");
    return res.status(200).json({ success: true, admin: safeAdmin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
