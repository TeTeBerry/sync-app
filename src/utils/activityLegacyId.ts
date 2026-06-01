/** Positive numeric activity legacy id from route param or card id. */
export function parseActivityLegacyId(value?: string | number | null): number | null {
  if (value == null || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}
