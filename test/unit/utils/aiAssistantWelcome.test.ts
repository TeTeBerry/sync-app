import { describe, expect, it } from 'vitest';
import { buildAiAssistantWelcomeText } from '@/utils/aiAssistantWelcome';

describe('buildAiAssistantWelcomeText', () => {
  it('locks welcome copy to the provided activity title', () => {
    expect(buildAiAssistantWelcomeText('EDC Thailand 2026')).toContain(
      'EDC Thailand 2026',
    );
  });
});
