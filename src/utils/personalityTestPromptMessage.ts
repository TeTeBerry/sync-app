import { getStartPersonalityTestCta } from '../constants/aiCtaLabels';
import { labelMatchesKey } from '@/i18n';

export function getPersonalityTestSheetActionLabel(): string {
  return getStartPersonalityTestCta();
}

export function isPersonalityTestSheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    labelMatchesKey(trimmed, 'ai.startPersonalityTest') ||
    trimmed.includes('Raver 人格测试') ||
    trimmed.includes('点下方按钮开始')
  );
}
