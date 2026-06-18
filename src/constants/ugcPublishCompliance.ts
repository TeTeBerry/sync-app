import { LEGAL_CONSENT_VERSION } from '../legal';

/** Storage key — bump with {@link LEGAL_CONSENT_VERSION} when publish rules change. */
export const UGC_PUBLISH_COMPLIANCE_STORAGE_KEY = `sync_ugc_publish_ack_${LEGAL_CONSENT_VERSION}`;

export const UGC_PUBLISH_COMPLIANCE_TITLE = '发布前确认';

export const UGC_PUBLISH_COMPLIANCE_MESSAGE =
  '请确认你发布的内容不含手机号、微信号、QQ、邮箱或链接等联系方式，不涉及收费组团或票务倒卖；结伴为用户自发行为，线下见面请自行甄别风险。';

export const UGC_PUBLISH_COMPLIANCE_CONFIRM_TEXT = '我已阅读并同意';
