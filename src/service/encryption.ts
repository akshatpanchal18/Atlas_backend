import bcrypt from "bcrypt";
import crypto from "crypto";

class EncryptionService {
  private static readonly SALT = process.env.SALT!;

  static generateSecret() {
    return crypto.randomBytes(32).toString("hex");
  }
  static async hash(secret: string): Promise<string> {
    return await bcrypt.hash(secret, this.SALT);
  }
  static async compare(secret: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(secret, hash);
  }
}
export default EncryptionService;
