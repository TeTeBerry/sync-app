import { describe, expect, it } from 'vitest';
import {
  resolveOrchestratorActivityQueryId,
  resolveOrchestratorGuideEventCity,
} from '@/pages/ai/assistant/hooks/aiAssistantOrchestrator.util';

describe('aiAssistantOrchestrator.util', () => {
  it('skips activity detail fetch when location is already provided', () => {
    expect(resolveOrchestratorActivityQueryId(42, 'Pattaya')).toBeUndefined();
    expect(resolveOrchestratorActivityQueryId(42, undefined)).toBe(42);
  });

  it('prefers injected location for guide event city', () => {
    expect(
      resolveOrchestratorGuideEventCity('Bangkok, Thailand', 'Pattaya'),
    ).toBeTruthy();
    expect(resolveOrchestratorGuideEventCity(undefined, 'Pattaya')).toBeTruthy();
  });
});
