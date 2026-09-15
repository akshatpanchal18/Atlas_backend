import { Router } from "express";
import { validate } from "../../middleware/zod";
import { sendOtpSchema, verifyEmailSchema } from "./auth.schema";
import AuthController from "./auth.controller";
import AuthMiddleware from "../../middleware/auth";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), AuthController.sendOtp);
router.post("/verify-email", validate(verifyEmailSchema), AuthController.verifyEmail);
router.get("/github", AuthController.githubLogin);
router.get("/github/callback", AuthController.githubCallback);

router.get("/google", AuthController.googleLogin);
router.get("/google/callback", AuthController.googleCallback);

router.get("/refresh", AuthMiddleware.validateSession, AuthController.restoreSession);
export default router;
