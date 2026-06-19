import { t } from '@/i18n';

/** Unified AI assistant CTA copy — resolved at call time for i18n. */
export function getGenerateTravelGuideCta(): string {
  return t('ai.generateTravelGuide');
}

export function getGenerateItineraryCta(): string {
  return t('ai.generateItinerary');
}

export function getBuddyPostCta(): string {
  return t('ai.buddyPost');
}

export function getStartPersonalityTestCta(): string {
  return t('ai.startPersonalityTest');
}

export function getTravelGuideTitle(): string {
  return t('ai.travelGuideTitle');
}

export function getItineraryTitle(): string {
  return t('ai.itineraryTitle');
}

export function getViewTravelGuideCta(): string {
  return t('ai.viewTravelGuide');
}

export function getViewItineraryCta(): string {
  return t('ai.viewItinerary');
}

export function getRegenerateCta(): string {
  return t('ai.regenerate');
}

export function getTravelGuideGeneratingText(): string {
  return t('ai.generatingTravelGuide');
}

export function getTravelGuideGeneratingStages(): readonly string[] {
  return [t('ai.generatingStage1'), t('ai.generatingStage2'), t('ai.generatingStage3')];
}

export function getTravelPlanReceiptOcrTip(): string {
  return t('ai.receiptOcrTip');
}

export function getTravelPlanReceiptOcrCta(): string {
  return t('ai.receiptOcrCta');
}
