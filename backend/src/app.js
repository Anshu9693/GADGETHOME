import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import productsRoutes from "./routes/products.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminStatsRoutes from "./routes/adminStats.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";
import { stripeWebhook } from "./controllers/stripe.webhook.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
// CORS: allow multiple origins via ALLOWED_ORIGINS env (comma-separated)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "").split(",").map((s) => s.trim()).filter(Boolean);
console.log("Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., curl, server-to-server) when origin is undefined
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
  },
  credentials: true,
}));

// DB
connectDB();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Stripe webhook must use raw body parser and be registered BEFORE express.json()
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Now register JSON body parser and Stripe routes
app.use(express.json());
app.use("/api/stripe", stripeRoutes);



// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products",  productsRoutes);
app.use("/api/wishlist",  wishlistRoutes);
app.use("/api/cart",cartRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/analytics", analyticsRoutes);


app.get("/", (req, res) => {
  res.send("hello");
});

export default app;
