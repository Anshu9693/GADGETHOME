import express from "express";
import multer from "multer";
import { authLimiter } from "../middleware/security.js";
import { adminLogin, adminSignup, adminLogout } from "../controllers/auth.controllers.js";
import { getAdminProfile, updateAdminProfile } from "../controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", authLimiter, adminSignup);
router.post("/login", authLimiter, adminLogin);
router.post("/logout",adminLogout);

router.get("/profile", adminAuthMiddleware, getAdminProfile);
router.put("/profile", adminAuthMiddleware, upload.single("avatar"), updateAdminProfile);




export default router   
