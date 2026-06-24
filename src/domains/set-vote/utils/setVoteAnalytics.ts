type SetVoteAnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function logSetVoteEvent(
  name:
    | 'set_vote_open'
    | 'set_vote_mode_on'
    | 'set_vote_submit'
    | 'set_vote_share'
    | 'set_vote_share_landing'
    | 'set_vote_cta_recruit_wall'
    | 'set_vote_sync_genres',
  payload?: SetVoteAnalyticsPayload,
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics] ${name}`, payload ?? {});
  }
}
