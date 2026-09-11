import { Request, Response } from "express";
import asyncHandler from "../../utils/async-handler";
import AuthService from "./auth.service";
import { ApiResponse } from "../../utils/api-response";
import { logger } from "../../config/pino";

class AuthController {
  private static readonly cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as const)
        : ("lax" as const),
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
  };
  static sendOtp = asyncHandler(async (req: Request, res: Response) => {
    logger.info({ body: req.body });
    const data = req.body;
    await AuthService.sendOtp(data);
    res.status(200).json(ApiResponse.noContent("Otp sent successfully"));
  });
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const { atlas_session, accessToken } = await AuthService.verifyEmail(data);
    res
      .status(200)
      .cookie("atlas_session", atlas_session, this.cookieOptions)
      .json(ApiResponse.created({ accessToken }, "user created"));
  });
  // static sendOtp = asyncHandler(async(req,res)=>{})
  // static sendOtp = asyncHandler(async(req,res)=>{})
}
export default AuthController;
