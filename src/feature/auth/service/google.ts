// ============ GoogleService.ts ============

import crypto from "crypto";
import { ApiError } from "../../../utils/api-error";
import { logger } from "../../../config/pino";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture: string;
}

export class GoogleService {
  private static CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  private static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
  private static CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!; // e.g. https://api.yourapp.com/auth/google/callback

  private static AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  private static TOKEN_URL = "https://oauth2.googleapis.com/token";
  private static USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

  static generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.CALLBACK_URL,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "consent",
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      code,
      redirect_uri: this.CALLBACK_URL,
      grant_type: "authorization_code",
    });
    logger.info({ GOOGLE_PARAMS: params });
    const res = await fetch(this.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      throw ApiError.badRequest(`Failed to exchange Google OAuth code: ${body}`);
    }

    const data = (await res.json()) as GoogleTokenResponse;
    return data.access_token;
  }

  static async getUser(accessToken: string): Promise<GoogleUserInfo> {
    const res = await fetch(this.USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw ApiError.badRequest(`Failed to fetch Google user info: ${body}`);
    }

    return (await res.json()) as GoogleUserInfo;
  }
}
