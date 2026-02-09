import express from "express";
import multer from "multer";
import {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategoryByName,
} from "../controllers/category.controller.js";

import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";
import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// ---------- USER ----------
router.get("/all", getAllCategories);


// correct order
router.get("/name/:name", getCategoryByName);
router.get("/:categoryId", getCategoryById);


// ---------- ADMIN ----------
router.post(
  "/create",
  adminAuthMiddleware,
  upload.single("image"),
  addCategory,
);

router.put(
  "/update/:categoryId",
  adminAuthMiddleware,
  upload.single("image"),
  updateCategory,
);

router.delete("/delete/:categoryId", adminAuthMiddleware, deleteCategory);

export default router;
