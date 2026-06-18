import { describe, expect, it } from 'vitest';
import {
  resolveInitialAutoGuideIntent,
  resolveInitialGuideSheetIntent,
  resolveInitialMessageIntent,
  resolveInitialPrefillGuideIntent,
} from '@/pages/ai/assistant/hooks/aiAssistantInitialIntents.util';

const guideForm = {
  departure: '上海',
  headcount: 2,
  budgetTier: 'standard' as const,
  accommodationNights: 2,
  selfDrive: false,
};

describe('aiAssistantInitialIntents.util', () => {
  it('sends trimmed initial message once streaming is idle', () => {
    expect(
      resolveInitialMessageIntent({
        initialMessage: '  hello  ',
        isStreaming: false,
        alreadyHandled: false,
      }),
    ).toEqual({ kind: 'send', text: 'hello' });
  });

  it('waits while chat is streaming', () => {
    expect(
      resolveInitialMessageIntent({
        initialMessage: 'hello',
        isStreaming: true,
        alreadyHandled: false,
      }),
    ).toEqual({ kind: 'wait' });
  });

  it('opens travel guide sheet from deep link when activity is bound', () => {
    expect(
      resolveInitialGuideSheetIntent({
        initialOpenAiGuideSheet: true,
        activityLegacyId: 4,
        alreadyHandled: false,
      }),
    ).toBe('open');
  });

  it('prefers prefill intent over open-sheet intent', () => {
    expect(
      resolveInitialGuideSheetIntent({
        initialOpenAiGuideSheet: true,
        initialPrefillTravelGuideForm: guideForm,
        activityLegacyId: 4,
        alreadyHandled: false,
      }),
    ).toBe('skip');
  });

  it('returns prefill form only once per activity', () => {
    expect(
      resolveInitialPrefillGuideIntent({
        initialPrefillTravelGuideForm: guideForm,
        activityLegacyId: 4,
        alreadyHandled: false,
      }),
    ).toEqual(guideForm);
    expect(
      resolveInitialPrefillGuideIntent({
        initialPrefillTravelGuideForm: guideForm,
        activityLegacyId: 4,
        alreadyHandled: true,
      }),
    ).toBeNull();
  });

  it('auto-runs travel guide when form is passed from event detail', () => {
    expect(
      resolveInitialAutoGuideIntent({
        initialAutoRunTravelGuideForm: guideForm,
        activityLegacyId: 4,
        alreadyHandled: false,
      }),
    ).toEqual(guideForm);
  });

  it('skips auto-run without activityLegacyId', () => {
    expect(
      resolveInitialAutoGuideIntent({
        initialAutoRunTravelGuideForm: guideForm,
        activityLegacyId: undefined,
        alreadyHandled: false,
      }),
    ).toBeNull();
  });
});
