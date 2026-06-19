import { getGenerateTravelGuideCta } from '../constants/aiCtaLabels';
import { labelMatchesKey } from '@/i18n';

export function getTravelGuideSheetActionLabel(): string {
  return getGenerateTravelGuideCta();
}

export function isTravelGuideSheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  const cta = getGenerateTravelGuideCta();
  return (
    trimmed.includes('好的，我来帮你生成出行攻略') ||
    trimmed.includes('好的，我来帮你规划出行攻略') ||
    trimmed.includes(`点下方「${cta}」`) ||
    trimmed.includes('点下方「AI出行攻略」') ||
    labelMatchesKey(trimmed, 'ai.generateTravelGuide')
  );
}
