import Taro from '@tarojs/taro';
import type { PersonalityQuestion } from '../types';
import { PERSONALITY_TEST_AUDIO_ASSET_KEYS } from '../constants/personalityTestMedia';
import {
  getCachedPersonalityMediaUrl,
  resolvePersonalityMediaUrl,
  resolvePersonalityMediaUrls,
} from './resolvePersonalityMedia';

const localAudioPathCache = new Map<string, string>();
const pendingLocalDownloads = new Map<string, Promise<string>>();

function isWeappRuntime(): boolean {
  return process.env.TARO_ENV === 'weapp';
}

export function collectPersonalityQuestionAudioKeys(
  questions: PersonalityQuestion[],
): string[] {
  const keys = new Set<string>();
  for (const question of questions) {
    const assetKey = question.media?.type === 'audio' ? question.media.assetKey : '';
    const trimmed = assetKey?.trim();
    if (trimmed) {
      keys.add(trimmed);
    }
  }
  return [...keys];
}

export function getCachedPersonalityAudioLocalPath(remoteUrl?: string): string {
  const trimmed = remoteUrl?.trim();
  if (!trimmed) return '';
  return localAudioPathCache.get(trimmed) ?? '';
}

async function downloadPersonalityAudioLocalPath(remoteUrl: string): Promise<string> {
  const trimmed = remoteUrl.trim();
  if (!trimmed) return '';

  const cached = localAudioPathCache.get(trimmed);
  if (cached) {
    return cached;
  }

  if (!isWeappRuntime()) {
    return trimmed;
  }

  let pending = pendingLocalDownloads.get(trimmed);
  if (!pending) {
    pending = Taro.downloadFile({ url: trimmed })
      .then((response) => {
        if (response.statusCode === 200 && response.tempFilePath?.trim()) {
          const localPath = response.tempFilePath.trim();
          localAudioPathCache.set(trimmed, localPath);
          return localPath;
        }
        return trimmed;
      })
      .catch(() => trimmed)
      .finally(() => {
        pendingLocalDownloads.delete(trimmed);
      });
    pendingLocalDownloads.set(trimmed, pending);
  }

  return pending;
}

export async function prefetchPersonalityAudioAssetKeys(
  assetKeys: string[],
): Promise<void> {
  const keys = [...new Set(assetKeys.map((key) => key.trim()).filter(Boolean))];
  if (!keys.length) {
    return;
  }

  await resolvePersonalityMediaUrls(keys);
  await Promise.all(
    keys.map(async (key) => {
      const remoteUrl =
        getCachedPersonalityMediaUrl(key) ?? (await resolvePersonalityMediaUrl(key));
      if (remoteUrl) {
        await downloadPersonalityAudioLocalPath(remoteUrl);
      }
    }),
  );
}

export async function prefetchPersonalityQuestionMedia(
  questions: PersonalityQuestion[],
): Promise<void> {
  await prefetchPersonalityAudioAssetKeys(
    collectPersonalityQuestionAudioKeys(questions),
  );
}

/** Warm known audio clips (home entry / route tap) before questions load. */
export function prefetchPersonalityTestAudioMedia(): void {
  void prefetchPersonalityAudioAssetKeys([...PERSONALITY_TEST_AUDIO_ASSET_KEYS]);
}

export async function resolvePersonalityAudioPlaybackSrc(
  assetKey: string,
): Promise<string> {
  const trimmed = assetKey.trim();
  if (!trimmed) {
    return '';
  }

  const remoteUrl =
    getCachedPersonalityMediaUrl(trimmed) ??
    (await resolvePersonalityMediaUrl(trimmed));
  if (!remoteUrl) {
    return '';
  }

  return downloadPersonalityAudioLocalPath(remoteUrl);
}

/** Test helper */
export function clearPersonalityAudioPrefetchCacheForTests(): void {
  localAudioPathCache.clear();
  pendingLocalDownloads.clear();
}
