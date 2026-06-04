import type { PostContentType } from './backend';

/** 表单可选标签（对应发帖 contentTypes / 正文 # 标签） */
export type BuddyPostTagId = 'team' | 'accommodation' | 'carpool' | 'vip';

export type AiBuddyPostFormValues = {
  /** YYYY-MM-DD */
  dateStart: string;
  /** YYYY-MM-DD */
  dateEnd: string;
  location: string;
  /** 文本输入，如「2人」「2-3人」 */
  headcount: string;
  tags: BuddyPostTagId[];
  note?: string;
};

/** Submit payload from buddy sheet (apply-flow may include feed sync). */
export type AiBuddyPostSubmitPayload = AiBuddyPostFormValues & {
  /** When false, post is created but activity feed is not refreshed until later. */
  syncToPostList?: boolean;
};

export const BUDDY_POST_TAG_OPTIONS: Array<{
  id: BuddyPostTagId;
  label: string;
  /** 正文首段，如「找组队」 */
  intentPhrase: string;
  hashTag: string;
  contentType: PostContentType;
}> = [
  {
    id: 'team',
    label: '组队',
    intentPhrase: '找组队',
    hashTag: '#组队',
    contentType: 'team',
  },
  {
    id: 'accommodation',
    label: '拼房',
    intentPhrase: '找拼房',
    hashTag: '#拼房',
    contentType: 'accommodation',
  },
  {
    id: 'carpool',
    label: '同路',
    intentPhrase: '找同路伙伴',
    hashTag: '#同路',
    contentType: 'carpool',
  },
  {
    id: 'vip',
    label: '拼卡',
    intentPhrase: '找拼卡',
    hashTag: '#拼卡',
    contentType: 'carpool',
  },
];
