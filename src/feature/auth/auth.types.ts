import z from "zod";
import { sendOtpSchema, verifyEmailSchema } from "./auth.schema";

export type SendOtpPayload = z.infer<typeof sendOtpSchema>;
export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>;

export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export interface GithubCallbackPayload {
  code: string;
  state: string;
}

export interface GithubIdentity {
  provider: "github";
  providerAccountId: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
