import { START_PERSONALITY_TEST_CTA } from '../constants/aiCtaLabels';

export const PERSONALITY_TEST_SHEET_ACTION_LABEL = START_PERSONALITY_TEST_CTA;

export function isPersonalityTestSheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes(START_PERSONALITY_TEST_CTA) ||
    trimmed.includes('Raver 人格测试') ||
    trimmed.includes('点下方按钮开始')
  );
}
