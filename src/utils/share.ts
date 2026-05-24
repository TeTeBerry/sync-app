import Taro from "@tarojs/taro";
import { ROUTES } from "./route";

export interface PinDanSharePayload {
  title: string;
  price: number;
  activityId: number;
  itemId: number;
}

export async function sharePinDanItem(payload: PinDanSharePayload, copiedToast: string) {
  const path = `${ROUTES.PINDAN}?activityId=${payload.activityId}#pindan-item-${payload.itemId}`;
  const text = `${payload.title} · ¥${payload.price}/人\n${path}`;

  if (process.env.TARO_ENV === `h5` && typeof navigator !== `undefined` && navigator.share) {
    try {
      await navigator.share({ title: payload.title, text });
      return;
    } catch {
      // cancelled or unsupported — fall back to clipboard
    }
  }

  await Taro.setClipboardData({ data: text });
  void Taro.showToast({ title: copiedToast, icon: `success` });
}
