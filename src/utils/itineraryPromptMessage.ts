import { getGenerateItineraryCta } from '../constants/aiCtaLabels';
import { labelMatchesKey } from '@/i18n';

export function getItinerarySheetActionLabel(): string {
  return getGenerateItineraryCta();
}

export function isItinerarySheetPrompt(text?: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes('专属行程') ||
    trimmed.includes('itinerary') ||
    labelMatchesKey(trimmed, 'ai.generateItinerary')
  );
}
