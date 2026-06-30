export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  return error instanceof Error ? error.message : fallback;
}
