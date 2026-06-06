import { describe, expect, it } from 'vitest';
import {
  buildTravelGuideCollectPrompt,
  listMissingTravelGuideSlots,
  mergeTravelGuideDraft,
  parseTravelGuideChatMessage,
  travelGuideDraftToForm,
} from '@/utils/travelGuideChatParse';

describe('travelGuideChatParse', () => {
  it('parses one-shot message', () => {
    const draft = parseTravelGuideChatMessage('上海2人舒适自驾住2晚');
    expect(draft.departure).toBe('上海');
    expect(draft.headcount).toBe(2);
    expect(draft.budgetTier).toBe('standard');
    expect(draft.selfDrive).toBe(true);
    expect(draft.accommodationNights).toBe(2);
    expect(travelGuideDraftToForm(draft, 2)).not.toBeNull();
  });

  it('merges multi-turn draft', () => {
    let draft = parseTravelGuideChatMessage('规划');
    expect(listMissingTravelGuideSlots(draft).length).toBeGreaterThan(0);

    draft = mergeTravelGuideDraft(draft, parseTravelGuideChatMessage('上海2人'));
    expect(draft.departure).toBe('上海');
    expect(draft.headcount).toBe(2);
    expect(listMissingTravelGuideSlots(draft)).toContain('budgetTier');

    draft = mergeTravelGuideDraft(draft, parseTravelGuideChatMessage('舒适 不自驾'));
    const form = travelGuideDraftToForm(draft, 2);
    expect(form?.budgetTier).toBe('standard');
    expect(form?.selfDrive).toBe(false);
  });

  it('builds collect prompt for missing slots', () => {
    const prompt = buildTravelGuideCollectPrompt(['departure', 'headcount']);
    expect(prompt).toContain('出发地');
    expect(prompt).toContain('人数');
  });

  it('parses budget-only replies', () => {
    expect(parseTravelGuideChatMessage('舒适').budgetTier).toBe('standard');
    expect(parseTravelGuideChatMessage('经济').budgetTier).toBe('economy');
    expect(parseTravelGuideChatMessage('豪华').budgetTier).toBe('comfort');
    expect(parseTravelGuideChatMessage('预算舒适').budgetTier).toBe('standard');
  });

  it('merges budget in a later turn', () => {
    let draft = mergeTravelGuideDraft(parseTravelGuideChatMessage('上海2人'), {});
    draft = mergeTravelGuideDraft(draft, parseTravelGuideChatMessage('舒适'));
    expect(travelGuideDraftToForm(draft, 2)?.budgetTier).toBe('standard');
  });
});
