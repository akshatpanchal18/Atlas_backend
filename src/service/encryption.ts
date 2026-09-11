import bcrypt from "bcrypt";
import crypto from "crypto";
import { logger } from "../config/pino";

class EncryptionService {
  private static readonly SALT = Number(process.env.SALT!);

  static generateSecret() {
    return crypto.randomBytes(32).toString("hex");
  }
  static async hash(secret: string): Promise<string> {
    logger.info(typeof this.SALT);
    return await bcrypt.hash(secret, this.SALT);
  }
  static async compare(secret: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(secret, hash);
  }
}
export default EncryptionService;
