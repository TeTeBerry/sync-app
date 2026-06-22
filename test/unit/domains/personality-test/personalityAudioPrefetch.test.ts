import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchPersonalityTestMediaUrls = vi.fn();
const downloadFile = vi.fn();

vi.mock('@/api/sync/personalityTest', () => ({
  fetchPersonalityTestMediaUrls: (...args: unknown[]) =>
    fetchPersonalityTestMediaUrls(...args),
}));

vi.mock('@/constants/api', () => ({
  isLiveApi: () => true,
}));

vi.mock('@tarojs/taro', () => ({
  default: {
    downloadFile: (...args: unknown[]) => downloadFile(...args),
  },
}));

import {
  clearPersonalityMediaUrlCacheForTests,
  getCachedPersonalityMediaUrl,
} from '@/domains/personality-test/utils/resolvePersonalityMedia';
import {
  clearPersonalityAudioPrefetchCacheForTests,
  collectPersonalityQuestionAudioKeys,
  getCachedPersonalityAudioLocalPath,
  prefetchPersonalityAudioAssetKeys,
  prefetchPersonalityQuestionMedia,
} from '@/domains/personality-test/utils/personalityAudioPrefetch';
import type { PersonalityQuestion } from '@/domains/personality-test/types';

const AUDIO_KEY = 'static/personality-test/audio/big-room-drop.mp3';
const REMOTE_URL = 'https://cdn.example/audio.mp3';

describe('personalityAudioPrefetch', () => {
  beforeEach(() => {
    clearPersonalityMediaUrlCacheForTests();
    clearPersonalityAudioPrefetchCacheForTests();
    fetchPersonalityTestMediaUrls.mockReset();
    downloadFile.mockReset();
    vi.stubEnv('TARO_ENV', 'weapp');
  });

  afterEach(() => {
    clearPersonalityMediaUrlCacheForTests();
    clearPersonalityAudioPrefetchCacheForTests();
    vi.unstubAllEnvs();
  });

  it('collects audio asset keys from questions', () => {
    const questions: PersonalityQuestion[] = [
      {
        id: 'audio-drop-bigroom',
        prompt: 'test',
        media: { type: 'audio', assetKey: AUDIO_KEY },
        options: [],
      },
      {
        id: 'track-unknown',
        prompt: 'test',
        options: [],
      },
    ];

    expect(collectPersonalityQuestionAudioKeys(questions)).toEqual([AUDIO_KEY]);
  });

  it('prefetches remote url and local download path', async () => {
    fetchPersonalityTestMediaUrls.mockResolvedValue({
      urls: { [AUDIO_KEY]: REMOTE_URL },
    });
    downloadFile.mockResolvedValue({
      statusCode: 200,
      tempFilePath: 'wxfile://tmp/audio.mp3',
    });

    await prefetchPersonalityAudioAssetKeys([AUDIO_KEY]);

    expect(getCachedPersonalityMediaUrl(AUDIO_KEY)).toBe(REMOTE_URL);
    expect(getCachedPersonalityAudioLocalPath(REMOTE_URL)).toBe(
      'wxfile://tmp/audio.mp3',
    );
    expect(downloadFile).toHaveBeenCalledWith({ url: REMOTE_URL });
  });

  it('dedupes concurrent downloads for the same remote url', async () => {
    fetchPersonalityTestMediaUrls.mockResolvedValue({
      urls: { [AUDIO_KEY]: REMOTE_URL },
    });
    downloadFile.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                statusCode: 200,
                tempFilePath: 'wxfile://tmp/audio.mp3',
              }),
            10,
          );
        }),
    );

    const questions: PersonalityQuestion[] = [
      {
        id: 'audio-drop-bigroom',
        prompt: 'test',
        media: { type: 'audio', assetKey: AUDIO_KEY },
        options: [],
      },
    ];

    await Promise.all([
      prefetchPersonalityQuestionMedia(questions),
      prefetchPersonalityQuestionMedia(questions),
    ]);

    expect(downloadFile).toHaveBeenCalledTimes(1);
  });
});
