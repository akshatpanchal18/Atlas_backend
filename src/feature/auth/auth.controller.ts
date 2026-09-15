import { Request, Response } from "express";
import asyncHandler from "../../utils/async-handler";
import AuthService from "./auth.service";
import { ApiResponse } from "../../utils/api-response";
import { logger } from "../../config/pino";
import GithubService from "./service/github";
import { GoogleService } from "./service/google";

class AuthController {
  private static readonly FRONTEND_URL = process.env.FRONTEND_URL!;
  private static readonly cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
  };
  private static readonly oauthStateCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: 10 * 60 * 1000, // 10 minutes
  };

  static sendOtp = asyncHandler(async (req: Request, res: Response) => {
    logger.info({ body: req.body });
    const data = req.body;
    await AuthService.sendOtp(data);
    res.status(200).json(ApiResponse.noContent("Otp sent successfully"));
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const { atlas_session, accessToken, isOnboardRequire, isNewUser } = await AuthService.verifyEmail(data);

    res.cookie("atlas_session", atlas_session, this.cookieOptions);

    return isNewUser
      ? res.status(201).json(ApiResponse.created({ accessToken, onboarding: isOnboardRequire }, "user created"))
      : res.status(200).json(ApiResponse.ok({ accessToken, onboarding: isOnboardRequire }, "logged in"));
  });

  /**
   * Start GitHub OAuth.
   * GET /auth/github
   */
  static githubLogin = asyncHandler(async (req: Request, res: Response) => {
    const state = GithubService.generateState();
    res.cookie("github_oauth_state", state, this.oauthStateCookieOptions);
    const authorizationUrl = GithubService.getAuthorizationUrl(state);
    return res.redirect(authorizationUrl);
  });

  /**
   * GitHub OAuth callback.
   * GET /auth/github/callback
   */
  static githubCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (typeof code !== "string" || typeof state !== "string") {
      throw new Error("Invalid GitHub OAuth callback");
    }

    const storedState = req.cookies.github_oauth_state;
    if (!storedState) {
      throw new Error("GitHub OAuth state missing");
    }
    if (storedState !== state) {
      throw new Error("Invalid GitHub OAuth state");
    }

    res.clearCookie("github_oauth_state", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
      path: "/",
    });

    const { atlas_session, isNewUser } = await AuthService.githubLogin(code);

    res.cookie("atlas_session", atlas_session, this.cookieOptions);

    /*
     * IMPORTANT:
     * Don't put accessToken in the URL.
     * Frontend already has session validation,
     * so redirect to the frontend and let it call
     * your session endpoint to obtain the access token.
     */
    const suffix = isNewUser ? "new" : "existing";
    return res.redirect(`${this.FRONTEND_URL}/auth/github/success?status=${suffix}`);
  });

  /**
   * Start Google OAuth.
   * GET /auth/google
   */
  static googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const state = GoogleService.generateState();
    res.cookie("google_oauth_state", state, this.oauthStateCookieOptions);
    const authorizationUrl = GoogleService.getAuthorizationUrl(state);
    return res.redirect(authorizationUrl);
  });

  /**
   * Google OAuth callback.
   * GET /auth/google/callback
   */
  static googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (typeof code !== "string" || typeof state !== "string") {
      throw new Error("Invalid Google OAuth callback");
    }

    const storedState = req.cookies.google_oauth_state;
    if (!storedState) {
      throw new Error("Google OAuth state missing");
    }
    if (storedState !== state) {
      throw new Error("Invalid Google OAuth state");
    }

    res.clearCookie("google_oauth_state", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
      path: "/",
    });

    const { atlas_session, isNewUser } = await AuthService.googleLogin(code);

    res.cookie("atlas_session", atlas_session, this.cookieOptions);

    const suffix = isNewUser ? "new" : "existing";
    return res.redirect(`${this.FRONTEND_URL}/auth/google/success?status=${suffix}`);
  });
  static restoreSession = asyncHandler(async (req, res) => {
    const session = req.session!;
    const { accessToken } = await AuthService.restoreSession(session);
    res.status(200).json(ApiResponse.created({ accessToken }, "session restored"));
  });
  // static sendOtp = asyncHandler(async(req,res)=>{})
}
export default AuthController;
