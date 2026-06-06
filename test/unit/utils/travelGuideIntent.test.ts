import { describe, expect, it } from 'vitest';
import { isTravelGuideIntent } from '@/utils/travelGuideIntent';

describe('isTravelGuideIntent', () => {
  it('matches shortcut and natural phrases', () => {
    expect(isTravelGuideIntent('AI攻略')).toBe(true);
    expect(isTravelGuideIntent('帮我规划行程')).toBe(true);
    expect(isTravelGuideIntent('帮我生成出行攻略')).toBe(true);
    expect(isTravelGuideIntent('规划')).toBe(true);
    expect(isTravelGuideIntent('规划一下')).toBe(true);
    expect(isTravelGuideIntent('攻略')).toBe(true);
  });

  it('does not match buddy shortcuts', () => {
    expect(isTravelGuideIntent('组队队友')).toBe(false);
    expect(isTravelGuideIntent('看看有没有组队帖')).toBe(false);
  });
});
