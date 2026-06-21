import type { AiGuidePlanFormValues } from '../../../../types/travelGuide';

export type InitialMessageIntent =
  | { kind: 'skip' }
  | { kind: 'wait' }
  | { kind: 'send'; text: string };

export function resolveInitialMessageIntent(options: {
  initialMessage?: string | null;
  isStreaming: boolean;
  alreadyHandled: boolean;
}): InitialMessageIntent {
  if (!options.initialMessage?.trim()) {
    return { kind: 'skip' };
  }
  if (options.alreadyHandled) {
    return { kind: 'skip' };
  }
  if (options.isStreaming) {
    return { kind: 'wait' };
  }
  return { kind: 'send', text: options.initialMessage.trim() };
}

export function resolveInitialGuideSheetIntent(options: {
  initialOpenAiGuideSheet: boolean;
  initialPrefillTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  alreadyHandled: boolean;
}): 'skip' | 'open' {
  if (!options.initialOpenAiGuideSheet) {
    return 'skip';
  }
  if (options.initialPrefillTravelGuideForm) {
    return 'skip';
  }
  if (options.alreadyHandled) {
    return 'skip';
  }
  if (options.activityLegacyId == null || Number.isNaN(options.activityLegacyId)) {
    return 'skip';
  }
  return 'open';
}

export function resolveInitialPrefillGuideIntent(options: {
  initialPrefillTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  alreadyHandled: boolean;
}): AiGuidePlanFormValues | null {
  if (!options.initialPrefillTravelGuideForm) {
    return null;
  }
  if (options.alreadyHandled) {
    return null;
  }
  if (options.activityLegacyId == null || Number.isNaN(options.activityLegacyId)) {
    return null;
  }
  return options.initialPrefillTravelGuideForm;
}

export function resolveInitialAutoGuideIntent(options: {
  initialAutoRunTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  alreadyHandled: boolean;
}): AiGuidePlanFormValues | null {
  if (!options.initialAutoRunTravelGuideForm) {
    return null;
  }
  if (options.alreadyHandled) {
    return null;
  }
  if (options.activityLegacyId == null || Number.isNaN(options.activityLegacyId)) {
    return null;
  }
  return options.initialAutoRunTravelGuideForm;
}

export function resolveInitialCapabilitySheetIntent(options: {
  enabled: boolean;
  activityLegacyId?: number;
  alreadyHandled: boolean;
}): 'skip' | 'open' {
  if (!options.enabled) {
    return 'skip';
  }
  if (options.alreadyHandled) {
    return 'skip';
  }
  if (options.activityLegacyId == null || Number.isNaN(options.activityLegacyId)) {
    return 'skip';
  }
  return 'open';
}
