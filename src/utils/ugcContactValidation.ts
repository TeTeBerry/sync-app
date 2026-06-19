/** Client-side UGC contact guard — mirrors backend `matchPostContactInfo` / `matchRiskRules` contact paths. */

export const UGC_CONTACT_FORBIDDEN_MESSAGE =
  '内容不可包含联系方式（手机号、微信号、邮箱、链接等），请修改后重试';

const SPAM_PATTERN = /(.)\1{8,}/;

const SCALPER_PATTERN =
  /黄牛|加价|代抢|出票|倒票|溢价|高价收|高价出|抢票代|囤票|转手|转票|票务/i;

const TRAFFIC_DIVERSION_PATTERN =
  /(?:微信|vx|wx|wxid|加我|私聊|二维码|引流|进群|代购群|扫码|加v|加V|➕v|➕V)/i;

const WECHAT_VARIANT_PATTERN = /\b(?:vx|wx|wxid)\b|微\s*信|威信|薇信|➕我|加好友/i;

const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/i;

const CONTACT_LABEL_PATTERN = /联系方式[：:]/;

const PHONE_PATTERN = /(?<!\d)1[3-9]\d(?:[\s-]?\d){8}(?!\d)/;

const QQ_PATTERN = /(?:QQ|qq)(?:号|：|:)?[\s]*\d{5,12}/i;

const WECHAT_ID_PATTERN = /(?:微信号|微信\s*号|微信\s*ID|wxid|WXID)[：:\s]*[\w-]{4,}/i;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function containsUgcContactInfo(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;

  if (
    CONTACT_LABEL_PATTERN.test(normalized) ||
    PHONE_PATTERN.test(normalized) ||
    QQ_PATTERN.test(normalized) ||
    WECHAT_ID_PATTERN.test(normalized) ||
    EMAIL_PATTERN.test(normalized)
  ) {
    return true;
  }

  if (
    TRAFFIC_DIVERSION_PATTERN.test(normalized) ||
    WECHAT_VARIANT_PATTERN.test(normalized) ||
    URL_PATTERN.test(normalized)
  ) {
    return true;
  }

  return false;
}

export function containsUgcRiskText(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;

  if (SPAM_PATTERN.test(normalized) || SCALPER_PATTERN.test(normalized)) {
    return true;
  }

  return containsUgcContactInfo(normalized);
}

export function getUgcContactValidationError(text: string): string | null {
  if (containsUgcRiskText(text.trim())) {
    return UGC_CONTACT_FORBIDDEN_MESSAGE;
  }
  return null;
}
