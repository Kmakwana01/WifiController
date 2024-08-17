import express from "express";
import { isAuthenticated } from "../middlewares/isAuth";
import {
  SignUp,
  Login,
  forgetPassword,
  compareCode,
  resetPassword,
  logOut,
  token,
} from "../controllers/authController";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.post("/forgetPassword", forgetPassword);
router.post("/compareCode", compareCode);
router.post("/resetPassword", resetPassword);
router.post("/logout", isAuthenticated, logOut);
router.post("/token", token);

export default router;
