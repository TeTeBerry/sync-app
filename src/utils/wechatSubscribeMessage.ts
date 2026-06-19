import Taro from '@tarojs/taro';

/** Compile-time injection — keep keys in `.env` / `.env.production` (empty ok). */
const COMMENT_TMPL = (process.env.TARO_APP_SUBSCRIBE_TMPL_COMMENT || '').trim();
const COMMENT_REPLY_TMPL = (
  process.env.TARO_APP_SUBSCRIBE_TMPL_COMMENT_REPLY ||
  COMMENT_TMPL ||
  ''
).trim();

function isWeappRuntime(): boolean {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
}

/** Request WeChat subscribe-message consent for post comment/reply alerts. */
export async function requestPostEngagementSubscribe(): Promise<void> {
  if (!isWeappRuntime()) return;

  const tmplIds = [...new Set([COMMENT_TMPL, COMMENT_REPLY_TMPL].filter(Boolean))];
  if (!tmplIds.length) return;

  try {
    // WeChat weapp uses tmplIds; Taro's Option type incorrectly requires entityIds (Alipay) too.
    await Taro.requestSubscribeMessage({
      tmplIds,
    } as Taro.requestSubscribeMessage.Option);
  } catch {
    // user declined or quota exhausted
  }
}

export function isPostEngagementSubscribeConfigured(): boolean {
  return Boolean(COMMENT_TMPL || COMMENT_REPLY_TMPL);
}
