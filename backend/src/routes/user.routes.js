import express from "express";
import { userLogin, userSignup ,userLogout} from "../controllers/auth.controllers.js";

const router = express.Router();


router.post("/signup",userSignup);
router.post("/login",userLogin);
router.post("/logout",userLogout);





export default router   