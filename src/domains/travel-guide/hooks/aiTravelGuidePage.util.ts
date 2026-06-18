import type { TravelGuideDetailPayload } from '../utils/travelGuideDetailStorage';
import type { parseTravelGuideFormFromShareQuery } from '../utils/travelGuideWechatShare.util';

type TravelGuideShareSeed = NonNullable<
  ReturnType<typeof parseTravelGuideFormFromShareQuery>
>;

export const AI_TRAVEL_GUIDE_FOOTER_BASE_PX = 72;

type WindowInfoLike = {
  screenHeight?: number;
  windowHeight?: number;
  safeArea?: { bottom: number } | null;
};

export function computeAiTravelGuideFooterChromePx(
  win: WindowInfoLike,
  footerBasePx = AI_TRAVEL_GUIDE_FOOTER_BASE_PX,
): number {
  const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
  const safeBottom =
    win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
  return footerBasePx + safeBottom;
}

export function shouldLoadTravelGuideDetail(options: {
  payload: TravelGuideDetailPayload | null;
  guideId: string;
}): boolean {
  return Boolean(!options.payload && options.guideId.trim());
}

/** @deprecated Prefer server fetch first; kept for legacy share fallback tests. */
export function shouldGenerateTravelGuideFromShare(options: {
  payload: TravelGuideDetailPayload | null;
  guideId: string;
  shareSeed: TravelGuideShareSeed | null;
}): boolean {
  return Boolean(
    !options.payload && options.guideId.trim() && options.shareSeed != null,
  );
}

export function resolveTravelGuideShareRef(options: {
  guideId: string;
  payload: TravelGuideDetailPayload | null;
}): { guideId: string; payload: TravelGuideDetailPayload } | null {
  if (!options.payload || !options.guideId.trim()) {
    return null;
  }
  return { guideId: options.guideId.trim(), payload: options.payload };
}
