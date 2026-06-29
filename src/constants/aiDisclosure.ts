import { t } from '@/i18n';

/** Shown on AI-generated travel guide UI. */
export function getAiTravelGuideDisclaimer(): string {
  return t('travelGuide.disclaimer');
}

/** Shown on AI-assisted buddy post compose / preview steps. */
export function getBuddyPostAiDisclaimer(): string {
  return t('ai.buddyPostDisclaimer');
}

/** Shown persistently on the AI assistant tab. */
export function getAiAssistantDisclaimer(): string {
  return t('ai.disclaimer');
}
