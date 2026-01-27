import express from "express";
import {
  getTotalRevenue,
  getTotalUsers,
} from "../controllers/adminStats.controller.js";

import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";

const router = express.Router();

// 📊 DASHBOARD STATS
router.get("/total-revenue", adminAuthMiddleware, getTotalRevenue);
router.get("/total-users", adminAuthMiddleware, getTotalUsers);

export default router;
