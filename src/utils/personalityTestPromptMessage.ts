export const PERSONALITY_TEST_SHEET_ACTION_LABEL = 'Raver 人格测试';

export function isPersonalityTestSheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return trimmed.includes('Raver 人格测试') || trimmed.includes('点下方按钮开始');
}
