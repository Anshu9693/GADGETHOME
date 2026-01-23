import { userAuthMiddleware } from "./user.auth.middleware";
import { adminAuthMiddleware } from "./admin.auth.middleware";

export const bothaAuthMiddleware = (req, res, next) => {
  if (userAuthMiddleware(req, res, next) || adminAuthMiddleware(req, res, next)) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
