import UserRepository from "../../repository/user/user";
import { ApiError } from "../../utils/api-error";
import { SendOtpPayload, VerifyEmailPayload } from "./auth.types";
import EmailService from "../../service/email";
import { otpTemplate } from "../../template/otp";
import { RedisService } from "../../service/redis";
import TokenService from "./service/token";
import AccountRepository from "../../repository/user/account";
import { AuthProvider } from "../../generated/prisma/enums";
import SessionRepository from "../../repository/user/session";
import EncryptionService from "../../service/encryption";
import { logger } from "../../config/pino";
import GithubService from "./service/github";
import { Prisma, Session } from "../../generated/prisma/client";
import { GoogleService } from "./service/google";

class AuthService {
  static LOGO_URL: string; // assume already defined elsewhere in the class

  static isUniqueConstraintError(err: unknown): boolean {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
  }

  // ---------- shared core: find-or-create user, bind provider account ----------
  private static async findOrLinkAccount(params: {
    provider: AuthProvider;
    providerId: string;
    email: string;
    profile?: {
      displayName?: string;
      username?: string;
      avatar?: string;
      onboardingCompleted?: boolean;
    };
  }) {
    const { provider, providerId, email, profile } = params;

    // 1. This exact provider+providerId already linked to an account? -> plain login
    let account = await AccountRepository.findByProvider(provider, providerId);
    if (account) {
      const user = await UserRepository.findById(account.userId);
      if (!user) throw ApiError.internal("User associated with account not found");
      return { user, account, isNewUser: false, isNewAccount: false };
    }

    // 2. Not linked yet — find existing user by email, or create a new one
    let user = await UserRepository.findByEmail(email);
    const isNewUser = !user;
    if (!user) {
      user = await UserRepository.create({ email, ...profile });
    }

    // 3. Bind this provider to that user (existing or freshly created)
    try {
      account = await AccountRepository.create({
        provider,
        providerId,
        user: { connect: { id: user.id } },
      });
    } catch (err) {
      // concurrent request already created it — recover instead of failing
      if (this.isUniqueConstraintError(err)) {
        account = await AccountRepository.findByProvider(provider, providerId);
        if (!account) throw err; // unexpected, rethrow
      } else {
        throw err;
      }
    }

    return { user, account, isNewUser, isNewAccount: true };
  }

  private static async issueSession(userId: string, accountId: string) {
    const secret = EncryptionService.generateSecret();
    const secretHash = await EncryptionService.hash(secret);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await SessionRepository.create({
      account: { connect: { id: accountId } },
      secretHash,
      expiresAt,
    });

    const accessToken = await TokenService.generateAccessToken(userId);
    const atlas_session = TokenService.generateSession(session.id, secret);

    return { accessToken, atlas_session };
  }

  // ---------- Email OTP ----------
  static async sendOtp(data: SendOtpPayload) {
    const { email } = data;
    logger.info({ email });
    const otp = EncryptionService.generateOTP();
    await RedisService.storeOTP(email, otp);
    logger.info({ logo: this.LOGO_URL });
    await EmailService.sendMail({
      to: email,
      subject: "Your OTP code",
      html: otpTemplate(otp, this.LOGO_URL),
    });
    return;
  }

  static async verifyEmail(data: VerifyEmailPayload) {
    const { email, otp } = data;

    const storedOtp = await RedisService.getOTP(email);
    if (!storedOtp) throw ApiError.notFound("OTP expired");
    if (storedOtp !== otp) throw ApiError.badRequest("Invalid OTP");
    await RedisService.deleteOTP(email);

    const { user, account, isNewUser } = await this.findOrLinkAccount({
      provider: AuthProvider.EMAIL_OTP,
      providerId: email,
      email,
    });

    const isOnboardRequire = !user.onboardingCompleted;
    const { accessToken, atlas_session } = await this.issueSession(user.id, account.id);

    return { accessToken, atlas_session, isOnboardRequire, isNewUser };
  }

  // ---------- GitHub OAuth ----------
  static async githubLogin(code: string) {
    const githubAccessToken = await GithubService.exchangeCodeForToken(code);
    const githubUser = await GithubService.getUser(githubAccessToken);
    const githubEmails = await GithubService.getEmails(githubAccessToken);
    const email = GithubService.resolveEmail(githubEmails); // must return a GitHub-verified email or null

    if (!email) {
      // No verified email from GitHub — do NOT silently create a null-email user
      // or fall through; force an explicit path (e.g. ask user to add/verify an email).
      throw ApiError.badRequest("GitHub account has no verified email. Please add a verified email on GitHub or sign up via email OTP.");
    }

    const { user, account, isNewUser } = await this.findOrLinkAccount({
      provider: AuthProvider.GITHUB,
      providerId: String(githubUser.id),
      email,
      profile: {
        displayName: githubUser.name ?? githubUser.login,
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        onboardingCompleted: true,
      },
    });

    const isOnboardRequire = !user.onboardingCompleted;
    const { accessToken, atlas_session } = await this.issueSession(user.id, account.id);

    return { accessToken, atlas_session, isOnboardRequire, isNewUser };
  }

  // ---------- Google OAuth ----------
  static async googleLogin(code: string) {
    const googleAccessToken = await GoogleService.exchangeCodeForToken(code);
    const googleUser = await GoogleService.getUser(googleAccessToken); // expects a verified email

    if (!googleUser.email || !googleUser.verified_email) {
      throw ApiError.badRequest("Google account has no verified email. Please use a verified Google account or sign up via email OTP.");
    }

    const { user, account, isNewUser } = await this.findOrLinkAccount({
      provider: AuthProvider.GOOGLE,
      providerId: googleUser.id,
      email: googleUser.email,
      profile: {
        displayName: googleUser.name,
        avatar: googleUser.picture,
        onboardingCompleted: true,
      },
    });

    const isOnboardRequire = !user.onboardingCompleted;
    const { accessToken, atlas_session } = await this.issueSession(user.id, account.id);

    return { accessToken, atlas_session, isOnboardRequire, isNewUser };
  }
  // ---------- Session  ----------
  static async restoreSession(session: Session) {
    const { id, accountId } = session;
    // logger.fatal({ sessionId: id });
    const find_account = await AccountRepository.findById(accountId);
    if (!find_account) {
      throw ApiError.conflict("account is not found");
    }
    const accessToken = await TokenService.generateAccessToken(find_account.userId);
    return { accessToken };
  }
}
export default AuthService;
