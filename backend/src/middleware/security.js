// Security middleware for input validation and rate limiting
import rateLimit from "express-rate-limit";

// ✅ General rate limiter (100 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Auth rate limiter (5 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// ✅ Input validation for common fields
export const validateInput = (req, res, next) => {
  // Only validate if body exists (POST, PUT requests)
  if (!req.body) {
    return next();
  }

  // Sanitize common fields
  if (req.body.email) {
    req.body.email = String(req.body.email).trim().toLowerCase();
  }
  if (req.body.fullName) {
    req.body.fullName = String(req.body.fullName).trim().substring(0, 100);
  }
  if (req.body.phone) {
    req.body.phone = String(req.body.phone).trim().substring(0, 20);
  }
  
  next();
};
