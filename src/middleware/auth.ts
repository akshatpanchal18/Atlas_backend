import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import TokenService from "../feature/auth/service/token";
import UserRepository from "../repository/user/user";
import jwt from "jsonwebtoken";
import EncryptionService from "../service/encryption";
import SessionRepository from "../repository/user/session";

class AuthMiddleware {
  static async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        throw ApiError.unauthorized("Authorization token is required");
      }

      const [type, token] = authorization.split(" ");

      if (type !== "Bearer" || !token) {
        throw ApiError.unauthorized("Invalid authorization token");
      }

      const payload = await TokenService.verifyAccessToken(token);

      const user = await UserRepository.findById(payload.id);

      if (!user) {
        throw ApiError.unauthorized("User not found");
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(ApiError.unauthorized("Access token expired", [], "TOKEN_EXPIRED"));
      }

      next(error);
    }
  }
  static async validateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const cookie = req.cookies.atlas_session;

      if (!cookie) {
        res.clearCookie("atlas_session");
        throw ApiError.unauthorized("No session cookie found");
      }

      const { id, secret } = await TokenService.decryptSessionCookie(cookie);
      const session = await SessionRepository.findById(id);

      const isValid = session && session.expiresAt > new Date() && (await EncryptionService.compare(secret, session.secretHash!));

      if (!isValid) {
        res.clearCookie("atlas_session");
        throw ApiError.unauthorized("Session expired or invalid");
      }

      req.session = session;
      next();
    } catch (error) {
      res.clearCookie("atlas_session");
      req.session = undefined;

      if (error instanceof ApiError) {
        return next(error);
      }
      // malformed/tampered cookie or unexpected decrypt failure
      next(ApiError.unauthorized("Invalid session"));
    }
  }
}
export default AuthMiddleware;
