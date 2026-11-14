/** Transport failures keep their status and endpoint across domain services. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly code: "HTTP_ERROR" | "INVALID_RESPONSE" = "HTTP_ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }
}
