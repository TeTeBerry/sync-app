/** Coerce unknown API values to trimmed string (never throws). */
export function safeTrim(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value == null) {
    return "";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

export function safeTrimOrUndefined(value: unknown): string | undefined {
  const trimmed = safeTrim(value);
  return trimmed.length > 0 ? trimmed : undefined;
}

export function safeFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}
