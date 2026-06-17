import { GENERATE_TRAVEL_GUIDE_CTA } from '../constants/aiCtaLabels';

export const TRAVEL_GUIDE_SHEET_ACTION_LABEL = GENERATE_TRAVEL_GUIDE_CTA;

export function isTravelGuideSheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes('好的，我来帮你生成出行攻略') ||
    trimmed.includes('好的，我来帮你规划出行攻略') ||
    trimmed.includes(`点下方「${GENERATE_TRAVEL_GUIDE_CTA}」`) ||
    trimmed.includes('点下方「AI出行攻略」')
  );
}
