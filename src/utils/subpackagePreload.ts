import Taro from '@tarojs/taro';

type SubpackageName = 'event' | 'profile';

const subpackagePromises = new Map<SubpackageName, Promise<void>>();

function loadSubpackage(name: SubpackageName): Promise<void> {
  if (process.env.TARO_ENV !== 'weapp') {
    return Promise.resolve();
  }

  const existing = subpackagePromises.get(name);
  if (existing) {
    return existing;
  }

  const load = (
    Taro as typeof Taro & {
      loadSubpackage?: (options: { name: string }) => Promise<unknown>;
    }
  ).loadSubpackage;

  if (typeof load !== 'function') {
    return Promise.resolve();
  }

  const promise = load({ name })
    .then(() => undefined)
    .catch(() => undefined);
  subpackagePromises.set(name, promise);
  return promise;
}

/** Pre-download event subpackage (packageEvent, name: event in app.config). */
export function preloadEventSubpackage(): void {
  void loadSubpackage('event');
}

export function preloadProfileSubpackage(): void {
  void loadSubpackage('profile');
}

/** Wait until the event subpackage is downloaded before navigateTo. */
export function ensureEventSubpackageLoaded(): Promise<void> {
  return loadSubpackage('event');
}
