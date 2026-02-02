import express from "express";
import multer from "multer";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
} from "../controllers/products.controller.js";

import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";
import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";
// import { bothaAuthMiddleware } from "../middleware/both.auth.middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// ---------- USER ROUTES ----------
// ---------- USER ROUTES ----------
router.get("/user/allproducts", 
  // userAuthMiddleware, 
  getAllProducts);
router.get("/user/featured", getFeaturedProducts);

// [GET /api/products/user/search?q=smart bulb]
router.get("/user/search", userAuthMiddleware, searchProducts );
// [GET /api/products/user/category/Smart Lighting]
router.get("/user/category/:category", userAuthMiddleware, getProductsByCategory);
router.get("/user/:productId", userAuthMiddleware, getSingleProduct);


// ---------- ADMIN ROUTES ----------

router.get("/admin/allproducts", adminAuthMiddleware, getAllProducts);
router.get("/admin/featured", adminAuthMiddleware, getFeaturedProducts);
router.get("/admin/:productId", adminAuthMiddleware, getSingleProduct);

router.post(
  "/createproduct",
  adminAuthMiddleware,
  upload.array("images", 5),
  createProduct,
);

router.put(
  "/updateproduct/:productId",
  adminAuthMiddleware,
  upload.array("images", 5),
  updateProduct,
);

router.delete("/deleteproduct/:productId", adminAuthMiddleware, deleteProduct);



export default router;
