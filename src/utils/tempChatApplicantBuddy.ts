import type { TeamApplyBuddyPreview } from './teamApplyBuddyPreview';

/** Demo applicant team profiles (temporary chat until real profiles API). */
const MOCK_APPLICANT_BUDDY: Record<string, TeamApplyBuddyPreview> = {
  'demo-luna': {
    body: '6/14-16 深圳 STORM，2 女 1 男，缺 1 男生，广州出发可拼车',
    location: '广州 → 深圳',
    tags: ['#组队', '#拼车'],
  },
  'demo-ryan': {
    body: '深圳本地，周末场组队，可带车接送福田 ↔ 场馆',
    location: '深圳',
    tags: ['#组队', '#拼车'],
  },
};

export function resolveApplicantBuddyInfo(userId: string): TeamApplyBuddyPreview {
  return (
    MOCK_APPLICANT_BUDDY[userId] ?? {
      body: '想一起组队参加活动，期待和你同行～',
      tags: ['#组队'],
    }
  );
}
