import express from "express";
import multer from "multer";
import { userLogin, userSignup, userLogout, loggedInUser } from "../controllers/auth.controllers.js";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/signup",userSignup);
router.post("/login",userLogin);
router.post("/logout",userLogout);
router.get  ("/me",userAuthMiddleware,loggedInUser);

router.get("/profile", userAuthMiddleware, getUserProfile);
router.put("/profile", userAuthMiddleware, upload.single("avatar"), updateUserProfile);






export default router   
