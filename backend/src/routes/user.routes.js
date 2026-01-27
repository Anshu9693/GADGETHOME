import express from "express";
import { userLogin, userSignup ,userLogout,loggedInUser} from "../controllers/auth.controllers.js";
import { userAuthMiddleware } from "../middleware/user.auth.middleware.js";

const router = express.Router();


router.post("/signup",userSignup);
router.post("/login",userLogin);
router.post("/logout",userLogout);
router.get  ("/me",userAuthMiddleware,loggedInUser);






export default router   