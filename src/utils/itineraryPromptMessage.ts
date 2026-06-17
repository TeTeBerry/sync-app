export const ITINERARY_SHEET_ACTION_LABEL = '专属行程';

export function isItinerarySheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes('好的，我来帮你生成专属演出行程') ||
    trimmed.includes('点下方「专属行程」')
  );
}
