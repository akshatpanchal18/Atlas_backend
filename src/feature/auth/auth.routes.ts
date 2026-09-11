import { Router } from "express";
import { validate } from "../../middleware/zod";
import { sendOtpSchema, verifyEmailSchema } from "./auth.schema";
import AuthController from "./auth.controller";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), AuthController.sendOtp);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  AuthController.verifyEmail,
);
export default router;
