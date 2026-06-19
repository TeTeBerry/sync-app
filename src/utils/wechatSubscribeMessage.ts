import Taro from '@tarojs/taro';

const COMMENT_TMPL = process.env.TARO_APP_SUBSCRIBE_TMPL_COMMENT?.trim() ?? '';
const COMMENT_REPLY_TMPL =
  process.env.TARO_APP_SUBSCRIBE_TMPL_COMMENT_REPLY?.trim() ?? COMMENT_TMPL;

/** Request WeChat subscribe-message consent for post comment/reply alerts. */
export async function requestPostEngagementSubscribe(): Promise<void> {
  if (process.env.TARO_ENV !== 'weapp') return;

  const tmplIds = [...new Set([COMMENT_TMPL, COMMENT_REPLY_TMPL].filter(Boolean))];
  if (!tmplIds.length) return;

  try {
    await Taro.requestSubscribeMessage({ tmplIds });
  } catch {
    // user declined or quota exhausted
  }
}

export function isPostEngagementSubscribeConfigured(): boolean {
  return Boolean(COMMENT_TMPL || COMMENT_REPLY_TMPL);
}
