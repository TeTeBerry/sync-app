import { describe, expect, it } from 'vitest';
import { detectActiveLetterFromScrollViewport } from '@/pages/events/utils/scrollCatalogArtistSection';

describe('scrollCatalogArtistSection', () => {
  it('detects the active letter from scroll viewport position', () => {
    const sections = [
      { letter: 'A', top: 120 },
      { letter: 'M', top: 420 },
      { letter: 'Z', top: 920 },
    ];

    expect(detectActiveLetterFromScrollViewport(100, sections)).toBe('A');
    expect(detectActiveLetterFromScrollViewport(120, sections)).toBe('A');
    expect(detectActiveLetterFromScrollViewport(500, sections)).toBe('M');
    expect(detectActiveLetterFromScrollViewport(1500, sections)).toBe('Z');
  });
});
