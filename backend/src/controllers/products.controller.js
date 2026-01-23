import ProductModel from "../models/products.model.js";
import { uploadFile } from "../services/services.storage.js";
import { v4 as uuid } from "uuid";



// ✅ GET ALL PRODUCTS (USER)
export const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ isActive: true });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ SEARCH PRODUCTS (USER)
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await ProductModel.find({
      isActive: true,
      $text: { $search: q },
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET PRODUCTS BY CATEGORY (USER)
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await ProductModel.find({
      category,
      // isActive: true,
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET FEATURED PRODUCTS
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({
      isFeatured: true,
      isActive: true,
    });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SINGLE PRODUCT
export const getSingleProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ CREATE PRODUCT (ADMIN)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      discountPrice,
      stock,
      description,
      connectivity,
      powerSource,
      warranty,
      isFeatured,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadFile(file.buffer, uuid());
        images.push(uploaded.url);
      }
    }

    const product = await ProductModel.create({
      name,
      brand,
      category,
      price,
      discountPrice,
      stock,
      description,
      images,
      connectivity,
      powerSource,
      warranty,
      isFeatured,
      createdBy: req.admin._id,
    });

    res.status(201).json({ message: "Product created successfully", success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ UPDATE PRODUCT (ADMIN)
export const updateProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let images = product.images;
    if (req.files?.length) {
      images = [];
      for (const file of req.files) {
        const uploaded = await uploadFile(file.buffer, uuid());
        images.push(uploaded.url);
      }
    }

    Object.assign(product, req.body, { images });

    await product.save();

    res.json({message:"Product updated successfully", success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE PRODUCT (ADMIN)
export const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
