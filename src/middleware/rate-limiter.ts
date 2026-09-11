import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis";

interface RateLimiterOptions {
  /**
   * Maximum number of requests allowed
   * during the configured window.
   */
  max: number;

  /**
   * Window duration in seconds.
   */
  windowSeconds: number;

  /**
   * Optional prefix used for Redis keys.
   */
  keyPrefix?: string;

  /**
   * Optional function to generate the identifier.
   *
   * By default, the client's IP is used.
   */
  keyGenerator?: (req: Request) => string;
}

const rateLimiter = ({
  max,
  windowSeconds,
  keyPrefix = "rate-limit",
  keyGenerator = (req) => req.ip || "unknown",
}: RateLimiterOptions) => {
  if (max <= 0) {
    throw new Error("Rate limiter 'max' must be greater than 0");
  }

  if (windowSeconds <= 0) {
    throw new Error("Rate limiter 'windowSeconds' must be greater than 0");
  }

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const identifier = keyGenerator(req);

    const key = `${keyPrefix}:${identifier}`;

    try {
      /**
       * INCR is atomic in Redis.
       *
       * We use a Lua script so that:
       *
       * 1. Counter is incremented.
       * 2. TTL is set only for the first request.
       *
       * Both operations happen atomically.
       */
      const result = await redisClient.eval(
        `
        local current = redis.call("INCR", KEYS[1])

        if current == 1 then
          redis.call("EXPIRE", KEYS[1], ARGV[1])
        end

        local ttl = redis.call("TTL", KEYS[1])

        return { current, ttl }
        `,
        {
          keys: [key],
          arguments: [String(windowSeconds)],
        },
      );

      if (!Array.isArray(result) || result.length < 2) {
        throw new Error("Invalid Redis rate limiter response");
      }

      const current = Number(result[0]);
      const ttl = Number(result[1]);

      if (!Number.isFinite(current) || !Number.isFinite(ttl)) {
        throw new Error("Invalid rate limiter values returned by Redis");
      }

      const remaining = Math.max(0, max - current);

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Math.max(0, ttl));

      if (current > max) {
        res.setHeader("Retry-After", Math.max(0, ttl));

        res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });

        return;
      }

      next();
    } catch (error) {
      /**
       * Rate limiter failure should not silently happen.
       *
       * You need to make an explicit decision here:
       *
       * - fail-open  -> allow request if Redis is unavailable
       * - fail-closed -> reject request if Redis is unavailable
       *
       * For most APIs, fail-open is preferable for a general
       * rate limiter because Redis being temporarily unavailable
       * shouldn't take down the entire API.
       */
      console.error("Rate limiter Redis error:", error);

      next();
    }
  };
};

export default rateLimiter;
