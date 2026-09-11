import { redisClient } from "../config/redis";

export class RedisService {
  /**
   * Store OTP
   */
  static async storeOTP(email: string, otp: string) {
    await redisClient.set(`otp:${email}`, otp, {
      EX: 600, // 10 Minutes
    });
  }

  /**
   * Get OTP
   */
  static async getOTP(email: string) {
    return await redisClient.get(`otp:${email}`);
  }

  /**
   * Delete OTP
   */
  static async deleteOTP(email: string) {
    await redisClient.del(`otp:${email}`);
  }

  /**
   * Check OTP Exists
   */
  static async hasOTP(email: string) {
    return await redisClient.exists(`otp:${email}`);
  }
}
