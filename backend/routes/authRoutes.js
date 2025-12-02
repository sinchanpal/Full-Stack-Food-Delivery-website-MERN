import express from "express";
import { resetPassword, sendOtp, signin, signout, signup, verifyOtp } from "../controllers/authControllers.js";

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.get('/signout', signout);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;