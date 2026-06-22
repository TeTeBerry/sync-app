/** Canonical activity legacy ids used across the app. */
export const EDC_THAILAND_2026_LEGACY_ID = 5;
export const EDC_KOREA_2026_LEGACY_ID = 8;

/** Activity hero images are stored in CloudBase and resolved by the backend API. */
export function resolveCatalogActivityImage(
  _legacyId: number | string | undefined | null,
  image?: string | null,
): string {
  return image?.trim() ?? '';
}
