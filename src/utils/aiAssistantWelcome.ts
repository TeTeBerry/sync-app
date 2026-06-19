import { t } from '@/i18n';

export function buildAiAssistantWelcomeText(activityTitle?: string): string {
  const trimmed = activityTitle?.trim();
  if (trimmed) {
    return t('ai.welcomeBound', { title: trimmed });
  }
  return t('ai.welcomeUnbound');
}
