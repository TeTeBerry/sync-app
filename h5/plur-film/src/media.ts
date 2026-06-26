import { buildPlurScenes, type PlurScene, type PlurSceneId } from './config';

declare const __PLUR_FILM_API_BASE_URL__: string;

const PLUR_SCENE_IMAGE_KEYS: Record<PlurSceneId, string> = {
  peace: 'static/plur/scenes/peace.jpg',
  love: 'static/plur/scenes/love.jpg',
  unity: 'static/plur/scenes/unity.jpg',
  respect: 'static/plur/scenes/respect.jpg',
};

type MediaUrlsResponse = {
  data?: { urls?: Record<string, string> };
  urls?: Record<string, string>;
};

export async function resolvePlurScenes(): Promise<PlurScene[]> {
  const apiBase = __PLUR_FILM_API_BASE_URL__.replace(/\/$/, '');
  if (!apiBase) {
    throw new Error('PLUR film API base URL is not configured');
  }

  const keys = Object.values(PLUR_SCENE_IMAGE_KEYS);
  const requestUrl = `${apiBase}/personality-test/media-urls?keys=${encodeURIComponent(keys.join(','))}`;
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Failed to load PLUR scene images (${response.status})`);
  }

  const payload = (await response.json()) as MediaUrlsResponse;
  const urls = payload.data?.urls ?? payload.urls ?? {};
  const images = Object.fromEntries(
    (Object.entries(PLUR_SCENE_IMAGE_KEYS) as Array<[PlurSceneId, string]>).map(
      ([sceneId, key]) => {
        const url = urls[key]?.trim();
        if (!url) {
          throw new Error(`Missing cloud URL for ${key}`);
        }
        return [sceneId, url];
      },
    ),
  ) as Record<PlurSceneId, string>;

  return buildPlurScenes(images);
}
