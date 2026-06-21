import { LEGAL_CONSENT_VERSION } from '../legal';

/** Storage key — bump with {@link LEGAL_CONSENT_VERSION} when publish rules change. */
export const UGC_PUBLISH_COMPLIANCE_STORAGE_KEY = `sync_ugc_publish_ack_${LEGAL_CONSENT_VERSION}`;

export const UGC_PUBLISH_COMPLIANCE_TITLE = '发布前确认';

export const UGC_PUBLISH_COMPLIANCE_MESSAGE =
  '请确认你发布或评论的内容不含手机号、微信号、QQ、邮箱或链接等联系方式，不涉及收费组团或票务倒卖；招募帖为公开信息展示，线下同行请自行甄别风险。';

export const BUDDY_POST_PUBLISH_SUCCESS_MESSAGE =
  '招募帖已发布。内容为公开信息展示，请勿留联系方式；线下同行请自行甄别。';

export const UGC_PUBLISH_COMPLIANCE_CONFIRM_TEXT = '我已阅读并同意';
