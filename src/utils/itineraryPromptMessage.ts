import { GENERATE_ITINERARY_CTA } from '../constants/aiCtaLabels';

export const ITINERARY_SHEET_ACTION_LABEL = GENERATE_ITINERARY_CTA;

export function isItinerarySheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes('好的，我来帮你生成专属演出行程') ||
    trimmed.includes('好的，我来帮你生成专属行程') ||
    trimmed.includes(`点下方「${GENERATE_ITINERARY_CTA}」`) ||
    trimmed.includes('点下方「专属行程」')
  );
}
