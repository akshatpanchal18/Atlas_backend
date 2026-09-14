type ApiStatusCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "TOKEN_EXPIRED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR"
  | (string & {});

const DEFAULT_STATUS_CODES: Record<number, ApiStatusCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
};

export class ApiError extends Error {
  status: number;
  statusCode: ApiStatusCode;
  errors: unknown[];

  constructor(
    status = 500,
    message = "Internal Server Error",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    super(message);

    this.status = status;

    // Use the default statusCode for this HTTP status,
    // unless the caller explicitly provides one.
    this.statusCode =
      statusCode ?? DEFAULT_STATUS_CODES[status] ?? "INTERNAL_SERVER_ERROR";

    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message = "Bad Request",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(400, message, errors, statusCode);
  }

  static unauthorized(
    message = "Unauthorized",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(401, message, errors, statusCode);
  }

  static forbidden(
    message = "Forbidden",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(403, message, errors, statusCode);
  }

  static notFound(
    message = "Resource not found",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(404, message, errors, statusCode);
  }

  static conflict(
    message = "Conflict",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(409, message, errors, statusCode);
  }

  static validation(
    message = "Validation failed",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(422, message, errors, statusCode);
  }

  static tooManyRequests(
    message = "Too many requests",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(429, message, errors, statusCode);
  }

  static internal(
    message = "Internal Server Error",
    errors: unknown[] = [],
    statusCode?: ApiStatusCode,
  ) {
    return new ApiError(500, message, errors, statusCode);
  }

  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
    };
  }
}
