import { describe, expect, it } from 'vitest';
import { resolveFestivalPrepCollapsedHint } from '@/domains/partner-feed/utils/resolveFestivalPrepCollapsedHint';

const t = (key: string) => key;

describe('resolveFestivalPrepCollapsedHint', () => {
  it('shows generate guide hint when supported and not generated', () => {
    const hint = resolveFestivalPrepCollapsedHint({
      travelGuideSupported: true,
      t,
    });
    expect(hint.text).toBe('eventDetail.festivalPrepHintGuideNew');
    expect(hint.actionable).toBe(true);
  });

  it('shows preparing hint for unsupported overseas fields', () => {
    const hint = resolveFestivalPrepCollapsedHint({
      travelGuideSupported: false,
      t,
    });
    expect(hint.text).toBe('eventDetail.festivalPrepHintGuidePreparing');
    expect(hint.actionable).toBe(false);
  });

  it('shows generated hint when guide exists', () => {
    const hint = resolveFestivalPrepCollapsedHint({
      travelGuideGenerated: true,
      travelGuideSupported: true,
      t,
    });
    expect(hint.text).toBe('eventDetail.festivalPrepHintGuideGenerated');
    expect(hint.actionable).toBe(true);
  });
});
