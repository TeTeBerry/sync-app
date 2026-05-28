/** WeChat-safe query helpers — do not use URLSearchParams (webpack may bind it incorrectly). */

export function parseQueryString(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const query = raw.replace(/^\?/, "").trim();
  if (!query) {
    return result;
  }

  for (const segment of query.split("&")) {
    if (!segment) {
      continue;
    }
    const eq = segment.indexOf("=");
    const rawKey = eq === -1 ? segment : segment.slice(0, eq);
    const rawValue = eq === -1 ? "" : segment.slice(eq + 1);
    try {
      const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      const value = decodeURIComponent(rawValue.replace(/\+/g, " "));
      if (key) {
        result[key] = value;
      }
    } catch {
      if (rawKey) {
        result[rawKey] = rawValue;
      }
    }
  }

  return result;
}

export function buildQueryString(params: Record<string, string | undefined>): string {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return pairs.join("&");
}

export function normalizeQueryString(rawQuery: string): string {
  if (!rawQuery) {
    return "";
  }
  const parsed = parseQueryString(rawQuery);
  const sorted = Object.keys(parsed).sort((a, b) => a.localeCompare(b));
  return sorted
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parsed[key]!)}`)
    .join("&");
}
