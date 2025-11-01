/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message from unknown error type
 * @param error - The error to extract message from
 * @param fallback - Fallback message if error message cannot be determined
 * @returns The error message string
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unknown error occurred"
): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return fallback;
}
