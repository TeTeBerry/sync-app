import Taro from "@tarojs/taro";

/** Pre-download event subpackage (packageEvent, name: event in app.config). */
export function preloadEventSubpackage(): void {
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

  void load({ name: "event" }).catch(() => {});
}
