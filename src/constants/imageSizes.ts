/**
 * Remote image request widths (logical CSS px × ~2 for retina).
 * Apply at display time via `thumbnailImageUrl` — do not bake into mapped API data.
 */
export const IMAGE_SIZE = {
  avatarSm: 96,
  avatarMd: 160,
  listThumb: 240,
  postImage: 400,
  /** Full-width hero: home showcase, event detail, list EventCard hero. */
  featuredHero: 750,
  eventCardHero: 750,
  /** Hot carousel tile (~200 CSS px wide). */
  eventCardHotCarousel: 420,
  /** Small square thumb (~56–92 CSS px). */
  eventCardCompact: 192,
  /** @deprecated use eventCardHero / eventCardCompact — kept for grep migration */
  eventCardList: 750,
  eventCardDefault: 192,
} as const;
