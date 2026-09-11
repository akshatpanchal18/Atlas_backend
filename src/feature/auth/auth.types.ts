import z from "zod";
import { sendOtpSchema, verifyEmailSchema } from "./auth.schema";

export type SendOtpPayload = z.infer<typeof sendOtpSchema>;
export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>;
