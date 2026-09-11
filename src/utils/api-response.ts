export class ApiResponse<T = unknown> {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: T,
  ) {}

  static ok<T>(data?: T, message = "Success") {
    return new ApiResponse(200, message, data);
  }

  static created<T>(data?: T, message = "Created successfully") {
    return new ApiResponse(201, message, data);
  }

  static accepted<T>(data?: T, message = "Request accepted") {
    return new ApiResponse(202, message, data);
  }

  static noContent(message = "No content") {
    return new ApiResponse(204, message);
  }

  /**
   * General-purpose response.
   * Use this when none of the helpers above fit.
   */
  static custom<T>(statusCode: number, message: string, data?: T) {
    return new ApiResponse(statusCode, message, data);
  }

  toJSON() {
    return {
      success: true,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    };
  }
}
