import { describe, expect, it } from 'vitest';
import { resolveAiChatProgressKind } from '@/utils/resolveAiChatProgressKind';

describe('resolveAiChatProgressKind', () => {
  it('maps lineup and activity queries', () => {
    expect(resolveAiChatProgressKind({ text: '查阵容' })).toBe('lineup');
    expect(resolveAiChatProgressKind({ text: '查最近活动' })).toBe('activity');
  });

  it('maps generation intents', () => {
    expect(resolveAiChatProgressKind({ text: '生成出行攻略' })).toBe('travel_guide');
    expect(resolveAiChatProgressKind({ text: '生成专属行程' })).toBe('itinerary');
    expect(resolveAiChatProgressKind({ text: '组队发帖' })).toBe('buddy_post');
  });

  it('maps dj queries', () => {
    expect(resolveAiChatProgressKind({ text: '有哪些 Techno DJ' })).toBe('dj_info');
  });

  it('falls back to thinking', () => {
    expect(resolveAiChatProgressKind({ text: '你好' })).toBe('thinking');
    expect(resolveAiChatProgressKind({ text: '' })).toBe('thinking');
  });
});
