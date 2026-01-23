import CategoryModel from "../models/category.model.js";
import { uploadFile } from "../services/services.storage.js";
import { v4 as uuid } from "uuid";

// ✅ ADD CATEGORY (ADMIN)
export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await CategoryModel.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    let image;
    if (req.file) {
      const uploaded = await uploadFile(req.file.buffer, uuid());
      image = uploaded.url;
    }

    const category = await CategoryModel.create({
      name,
      description,
      image,
      createdBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL CATEGORIES (USER + ADMIN)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE CATEGORY (ADMIN)
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (req.file) {
      const uploaded = await uploadFile(req.file.buffer, uuid());
      category.image = uploaded.url;
    }

    Object.assign(category, req.body);
    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE CATEGORY (ADMIN – SOFT DELETE)
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = false;
    await category.save();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
