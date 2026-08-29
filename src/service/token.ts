import jwt, { Secret, SignOptions } from "jsonwebtoken";
interface TokenPayload extends jwt.JwtPayload {
  id: string;
}
class TokenService {
  private static readonly ACCESS_TOKEN_SECRET: Secret =
    process.env.ACCESS_TOKEN_SECRET!;
  private static readonly ACCESS_TOKEN_VALIDITY = process.env
    .ACCESS_TOKEN_VALIDITY as SignOptions["expiresIn"];

  static generateAccessToken(id: string): string {
    return jwt.sign({ id }, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_VALIDITY,
    });
  }
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
  }
}
export default TokenService;
