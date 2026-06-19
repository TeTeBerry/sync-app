import Taro from '@tarojs/taro';

/** Compile-time injection — keep keys in `.env` / `.env.production` (empty ok). */
const COMMENT_TMPL = (process.env.TARO_APP_SUBSCRIBE_TMPL_COMMENT || '').trim();
const COMMENT_REPLY_TMPL = (
  process.env.TARO_APP_SUBSCRIBE_TMPL_COMMENT_REPLY ||
  COMMENT_TMPL ||
  ''
).trim();
const ACTIVITY_UPDATE_TMPL = (
  process.env.TARO_APP_SUBSCRIBE_TMPL_ACTIVITY_UPDATE || ''
).trim();

function isWeappRuntime(): boolean {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
}

async function requestSubscribeMessage(tmplIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(tmplIds.filter(Boolean))];
  if (!uniqueIds.length) return;

  try {
    await Taro.requestSubscribeMessage({
      tmplIds: uniqueIds,
    } as Taro.requestSubscribeMessage.Option);
  } catch {
    // user declined or quota exhausted
  }
}

/** Request WeChat subscribe-message consent for post comment/reply alerts. */
export async function requestPostEngagementSubscribe(): Promise<void> {
  if (!isWeappRuntime()) return;
  await requestSubscribeMessage([COMMENT_TMPL, COMMENT_REPLY_TMPL]);
}

/** Request WeChat subscribe-message consent for activity lineup / schedule updates. */
export async function requestActivityUpdateSubscribe(): Promise<void> {
  if (!isWeappRuntime()) return;
  await requestSubscribeMessage([ACTIVITY_UPDATE_TMPL]);
}

export function isPostEngagementSubscribeConfigured(): boolean {
  return Boolean(COMMENT_TMPL || COMMENT_REPLY_TMPL);
}

export function isActivityUpdateSubscribeConfigured(): boolean {
  return Boolean(ACTIVITY_UPDATE_TMPL);
}
