import type { ItineraryTimelineDotColor } from "./myItineraryMock";

/** SYNC app theme tokens for lock-screen wallpaper (canvas cannot read CSS vars). */
export const WALLPAPER_THEME = {
  bgTop: "#050508",
  bgBottom: "#120810",
  glowPurple: "rgba(123, 97, 255, 0.22)",
  glowPink: "rgba(255, 0, 102, 0.12)",
  textPrimary: "#ffffff",
  textSecondary: "#8e8e93",
  textMuted: "rgba(255, 255, 255, 0.45)",
  cardBg: "rgba(28, 28, 30, 0.88)",
  cardBorder: "rgba(255, 255, 255, 0.06)",
  brand: "#ff0066",
  timePink: "#ff0066",
} as const;

export const WALLPAPER_ACCENT: Record<
  ItineraryTimelineDotColor,
  { time: string; dot: string }
> = {
  pink: { time: "#ff0066", dot: "#ff0066" },
  cyan: { time: "#22d3ee", dot: "#22d3ee" },
  purple: { time: "#7b61ff", dot: "#7b61ff" },
};

/** Per-day timeline rail / date pill accent (参考稿：首日粉、次日紫). */
export const WALLPAPER_SECTION_STYLE = [
  {
    rail: "#ff0066",
    pillBg: "rgba(255, 0, 102, 0.1)",
    pillBorder: "rgba(255, 0, 102, 0.55)",
    dot: "#ff0066",
  },
  {
    rail: "#7b61ff",
    pillBg: "rgba(123, 97, 255, 0.12)",
    pillBorder: "rgba(123, 97, 255, 0.55)",
    dot: "#7b61ff",
  },
  {
    rail: "#22d3ee",
    pillBg: "rgba(34, 211, 238, 0.1)",
    pillBorder: "rgba(34, 211, 238, 0.5)",
    dot: "#22d3ee",
  },
] as const;

export function sectionStyleForIndex(index: number) {
  return WALLPAPER_SECTION_STYLE[index % WALLPAPER_SECTION_STYLE.length];
}
