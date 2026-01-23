import express from "express";
import { adminLogin, adminSignup ,adminLogout} from "../controllers/auth.controllers.js";

const router = express.Router();


router.post("/signup",adminSignup);
router.post("/login",adminLogin);
router.post("/logout",adminLogout);





export default router   