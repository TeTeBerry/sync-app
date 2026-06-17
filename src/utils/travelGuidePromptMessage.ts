export const TRAVEL_GUIDE_SHEET_ACTION_LABEL = 'AI出行攻略';

export function isTravelGuideSheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes('好的，我来帮你生成出行攻略') ||
    trimmed.includes('好的，我来帮你规划出行攻略')
  );
}
