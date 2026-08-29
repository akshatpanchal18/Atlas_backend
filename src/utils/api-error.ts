export class ApiError extends Error {
  statusCode: number;
  errors: unknown[];

  constructor(
    statusCode = 500,
    message = "Internal Server Error",
    errors: unknown[] = [],
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", errors: unknown[] = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized", errors: unknown[] = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden", errors: unknown[] = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = "Resource not found", errors: unknown[] = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Conflict", errors: unknown[] = []) {
    return new ApiError(409, message, errors);
  }

  static validation(message = "Validation failed", errors: unknown[] = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(
    message = "Too many requests",
    errors: unknown[] = [],
  ) {
    return new ApiError(429, message, errors);
  }

  static internal(message = "Internal Server Error", errors: unknown[] = []) {
    return new ApiError(500, message, errors);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
    };
  }
}
