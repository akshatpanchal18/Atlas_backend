import type { NextFunction, Request, Response } from "express";

import { logger } from "../config/pino";
import { ApiError } from "../utils/api-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled error",
  );

  // Known application error
  if (err instanceof ApiError) {
    return res.status(err.status).json(err.toJSON());
  }

  // Unknown/unexpected error
  return res.status(500).json({
    status: 500,
    statusCode: "INTERNAL_SERVER_ERROR",
    message: "Internal Server Error",
    errors: [],
  });
};
