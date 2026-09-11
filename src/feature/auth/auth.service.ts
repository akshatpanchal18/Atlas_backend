import crypto from "crypto";
import UserRepository from "../../repository/user/user";
import { ApiError } from "../../utils/api-error";
import { SendOtpPayload, VerifyEmailPayload } from "./auth.types";
import EmailService from "../../service/email";
import { otpTemplate } from "../../template/otp";
import { RedisService } from "../../service/redis";
import TokenService from "../../service/auth/token";
import AccountRepository from "../../repository/user/account";
import { AuthProvider } from "../../generated/prisma/enums";
import SessionRepository from "../../repository/user/session";
import EncryptionService from "../../service/encryption";
import { logger } from "../../config/pino";

class AuthService {
  private static readonly LOGO_URL = process.env.LOGO_URL!;
  static generateOTP(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }
  static async sendOtp(data: SendOtpPayload) {
    const { email } = data;
    logger.info({ email });
    const find_user = await UserRepository.findByEmail(email);
    if (find_user) {
      throw ApiError.badRequest("user already exist");
    }
    const otp = this.generateOTP();
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
    // 1. Get OTP
    const storedOtp = await RedisService.getOTP(email);
    logger.info({
      email,
      otp,
      otpType: typeof otp,
      storedOtp,
      storedOtpType: typeof storedOtp,
      equal: storedOtp === otp,
    });

    if (!storedOtp) {
      throw ApiError.notFound("OTP expired");
    }

    // 2. Verify OTP
    if (storedOtp !== otp) {
      throw ApiError.badRequest("Invalid OTP");
    }

    // 3. Delete OTP after successful verification
    await RedisService.deleteOTP(email);

    // 4. Check whether EMAIL_OTP account already exists
    let account = await AccountRepository.findByProvider(
      AuthProvider.EMAIL_OTP,
      email,
    );

    let user;

    if (account) {
      // Existing user
      user = await UserRepository.findById(account.userId);

      if (!user) {
        throw ApiError.internal("User associated with account not found");
      }
    } else {
      // 5. Check whether a user already exists with this email
      user = await UserRepository.findByEmail(email);

      if (!user) {
        // 6. New user
        user = await UserRepository.create({
          email,
        });
      }

      // 7. Create EMAIL_OTP authentication account
      account = await AccountRepository.create({
        provider: AuthProvider.EMAIL_OTP,
        providerId: email,
        user: {
          connect: {
            id: user.id,
          },
        },
      });
    }

    const secret = EncryptionService.generateSecret();

    const secretHash = await EncryptionService.hash(secret);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await SessionRepository.create({
      account: {
        connect: {
          id: account.id,
        },
      },
      secretHash,
      expiresAt,
    });

    // 9. Generate short-lived access token
    const accessToken = await TokenService.generateAccessToken(user.id);
    const atlas_session = TokenService.generateSession(session.id, secret);
    return {
      accessToken,
      atlas_session,
    };
  }
}
export default AuthService;
