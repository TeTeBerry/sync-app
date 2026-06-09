/** Canonical hero images for catalog activities (overrides stale API / persisted home cache). */
export const EDC_THAILAND_2026_LEGACY_ID = 5;

export const EDC_THAILAND_2026_IMAGE_URL =
  'https://ik.imagekit.io/TBR/Island%20Events/EDC%20Thailand%202026.png?updatedAt=1763068886366';

const ACTIVITY_CATALOG_IMAGE_BY_LEGACY_ID: Readonly<Record<number, string>> = {
  [EDC_THAILAND_2026_LEGACY_ID]: EDC_THAILAND_2026_IMAGE_URL,
};

export function resolveCatalogActivityImage(
  legacyId: number | string | undefined | null,
  image?: string | null,
): string {
  const parsed =
    typeof legacyId === 'number'
      ? legacyId
      : legacyId != null && legacyId !== ''
        ? Number(legacyId)
        : NaN;
  const override = Number.isFinite(parsed)
    ? ACTIVITY_CATALOG_IMAGE_BY_LEGACY_ID[parsed]
    : undefined;
  if (override) {
    return override;
  }
  return image?.trim() ?? '';
}
