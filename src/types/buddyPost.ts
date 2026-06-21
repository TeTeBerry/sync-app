/** 留言类型固定为组队 */
export type BuddyPostTagId = 'team';

export type AiBuddyPostFormValues = {
  /** YYYY-MM-DD */
  dateStart: string;
  /** YYYY-MM-DD */
  dateEnd: string;
  location: string;
  /** 文本输入，如「2人」「2-3人」「1/3」 */
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
  /** 正文首段，如「组队」 */
  intentPhrase: string;
  hashTag: string;
}> = [
  {
    id: 'team',
    label: '组队',
    intentPhrase: '组队',
    hashTag: '#组队',
  },
];
