export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const record = err as {
      message?: string;
      description?: string;
      error?: { description?: string; reason?: string };
    };
    return (
      record.error?.description ||
      record.error?.reason ||
      record.description ||
      record.message ||
      fallback
    );
  }
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}
