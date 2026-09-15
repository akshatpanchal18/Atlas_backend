import axios from "axios";
import crypto from "node:crypto";

import { GithubEmail, GithubUser } from "../auth.types";
import { ApiError } from "../../../utils/api-error";

class GithubService {
  private static readonly githubApi = "https://api.github.com";
  private static readonly githubOAuth = "https://github.com/login/oauth";

  private static readonly GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;

  private static readonly GITHUB_CLIENT_SECRET =
    process.env.GITHUB_CLIENT_SECRET!;

  private static readonly GITHUB_CALLBACK_URL =
    process.env.GITHUB_CALLBACK_URL!;

  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.GITHUB_CLIENT_ID,
      redirect_uri: this.GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
      state,
    });

    return `${this.githubOAuth}/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const response = await axios.post(
      `${this.githubOAuth}/access_token`,
      {
        client_id: this.GITHUB_CLIENT_ID,
        client_secret: this.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: this.GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.data.access_token) {
      throw ApiError.badRequest("Failed to obtain GitHub access token");
    }

    return response.data.access_token;
  }

  static async getUser(accessToken: string): Promise<GithubUser> {
    const response = await axios.get<GithubUser>(`${this.githubApi}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    return response.data;
  }

  static async getEmails(accessToken: string): Promise<GithubEmail[]> {
    const response = await axios.get<GithubEmail[]>(
      `${this.githubApi}/user/emails`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    return response.data;
  }

  static resolveEmail(emails: GithubEmail[]): string {
    const primaryVerifiedEmail = emails.find(
      (email) => email.primary && email.verified,
    );

    if (primaryVerifiedEmail) {
      return primaryVerifiedEmail.email;
    }

    const verifiedEmail = emails.find((email) => email.verified);

    if (verifiedEmail) {
      return verifiedEmail.email;
    }

    throw ApiError.badRequest("No verified GitHub email found");
  }

  static generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
export default GithubService;
