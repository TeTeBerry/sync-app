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

export const BUDDY_POST_TAG_OPTIONS: Array<{
  id: BuddyPostTagId;
  label: string;
  /** 正文首段，如「找队友」 */
  intentPhrase: string;
  hashTag: string;
  contentType: PostContentType;
}> = [
  {
    id: 'team',
    label: '组队',
    intentPhrase: '找队友',
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
    label: '拼车',
    intentPhrase: '找拼车',
    hashTag: '#拼车',
    contentType: 'carpool',
  },
  {
    id: 'vip',
    label: '拼卡',
    intentPhrase: '找拼卡',
    hashTag: '#拼卡',
    /** 与 #拼卡 / post-content-type 一致：找进场搭子，非转票 */
    contentType: 'carpool',
  },
];
