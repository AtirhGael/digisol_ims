type ApiErrorBody = {
  message?: string;
  error?: string;
  details?: string | string[] | unknown;
};

/**
 * Prefer server validation detail (`error`, `details`) over generic `message`
 * (e.g. "Validation failed") from API JSON bodies.
 */
export function getApiErrorMessage(error: unknown): string | undefined {
  const err = error as { response?: { data?: ApiErrorBody } };
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return undefined;

  if (typeof data.error === "string") {
    const t = data.error.trim();
    if (t) return t;
  }

  const { details } = data;
  if (Array.isArray(details)) {
    const parts = details.filter((x): x is string => typeof x === "string");
    const joined = parts.join(", ").trim();
    if (joined) return joined;
  } else if (typeof details === "string") {
    const t = details.trim();
    if (t) return t;
  }

  if (typeof data.message === "string") {
    const t = data.message.trim();
    if (t) return t;
  }

  return undefined;
}

export function getApiErrorToastMessage(
  error: unknown,
  fallback: string,
): string {
  return getApiErrorMessage(error) ?? fallback;
}
