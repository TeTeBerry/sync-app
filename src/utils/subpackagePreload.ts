import Taro from "@tarojs/taro";

type SubpackageName = "event" | "profile" | "ai";

function loadSubpackage(name: SubpackageName): void {
  if (process.env.TARO_ENV !== "weapp") {
    return;
  }

  const load = (
    Taro as typeof Taro & {
      loadSubpackage?: (options: { name: string }) => Promise<unknown>;
    }
  ).loadSubpackage;

  if (typeof load !== "function") {
    return;
  }

  void load({ name }).catch(() => {});
}

/** Pre-download event subpackage (packageEvent, name: event in app.config). */
export function preloadEventSubpackage(): void {
  loadSubpackage("event");
}

export function preloadProfileSubpackage(): void {
  loadSubpackage("profile");
}

export function preloadAiSubpackage(): void {
  loadSubpackage("ai");
}

/** Warm stack subpackages after main tabs settle. */
export function preloadStackSubpackages(): void {
  preloadEventSubpackage();
  preloadProfileSubpackage();
  preloadAiSubpackage();
}
