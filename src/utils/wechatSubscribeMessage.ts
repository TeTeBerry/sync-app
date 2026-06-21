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

export type SubscribeMessageOutcome =
  | 'accepted'
  | 'rejected'
  | 'unconfigured'
  | 'unsupported';

function isWeappRuntime(): boolean {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
}

function resolveTemplateOutcome(
  result: Record<string, string | undefined> | undefined,
  templateId: string,
): SubscribeMessageOutcome {
  if (!templateId) return 'unconfigured';
  const status = result?.[templateId];
  if (status === 'accept') return 'accepted';
  if (status === 'reject' || status === 'ban' || status === 'filter') {
    return 'rejected';
  }
  return 'rejected';
}

async function requestSubscribeMessage(
  tmplIds: string[],
): Promise<Record<string, string | undefined> | undefined> {
  const uniqueIds = [...new Set(tmplIds.filter(Boolean))];
  if (!uniqueIds.length) return undefined;

  try {
    return (await Taro.requestSubscribeMessage({
      tmplIds: uniqueIds,
    } as Taro.requestSubscribeMessage.Option)) as Record<string, string | undefined>;
  } catch {
    return undefined;
  }
}

/** Request WeChat subscribe-message consent for post comment/reply alerts. */
export async function requestPostEngagementSubscribe(): Promise<void> {
  if (!isWeappRuntime()) return;
  await requestSubscribeMessage([COMMENT_TMPL, COMMENT_REPLY_TMPL]);
}

/** Request WeChat subscribe-message consent for activity lineup / schedule updates. */
export async function requestActivityUpdateSubscribe(): Promise<SubscribeMessageOutcome> {
  if (!isWeappRuntime()) return 'unsupported';
  if (!ACTIVITY_UPDATE_TMPL) return 'unconfigured';

  const result = await requestSubscribeMessage([ACTIVITY_UPDATE_TMPL]);
  return resolveTemplateOutcome(result, ACTIVITY_UPDATE_TMPL);
}

export function isPostEngagementSubscribeConfigured(): boolean {
  return Boolean(COMMENT_TMPL || COMMENT_REPLY_TMPL);
}

export function isActivityUpdateSubscribeConfigured(): boolean {
  return Boolean(ACTIVITY_UPDATE_TMPL);
}
