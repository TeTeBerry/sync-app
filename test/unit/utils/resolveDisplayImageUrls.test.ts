import { describe, expect, it, vi } from 'vitest';
import {
  blankUnresolvedImageUrls,
  resolveDisplayImageUrls,
} from '../../../src/utils/resolveDisplayImageUrls';

vi.mock('../../../src/utils/cloudImage', () => ({
  isCloudStorageFileId: (src: string) => src.startsWith('cloud://'),
  resolveCloudFileIdsToTempUrls: vi.fn(async (ids: string[]) =>
    ids.map((id) => `https://tmp/${id.slice(-8)}`),
  ),
}));

describe('resolveDisplayImageUrls', () => {
  it('blanks cloud fileIDs until resolved', () => {
    expect(
      blankUnresolvedImageUrls([
        'cloud://env.x/ugc/posts/u1/a.jpg',
        'https://cdn.example/hero.jpg',
      ]),
    ).toEqual(['', 'https://cdn.example/hero.jpg']);
  });

  it('resolves cloud fileIDs and passes through https urls', async () => {
    const cloud = 'cloud://env.x/ugc/posts/u1/a.jpg';
    const resolved = await resolveDisplayImageUrls([
      cloud,
      'https://cdn.example/hero.jpg',
    ]);
    expect(resolved[0]).toMatch(/^https:\/\/tmp\//);
    expect(resolved[1]).toBe('https://cdn.example/hero.jpg');
  });
});
