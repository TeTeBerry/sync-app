import type { ItineraryBuddyRecruitHint } from '../types/backend';

export function formatItineraryBuddyRecruitHintMessage(
  hint: Pick<ItineraryBuddyRecruitHint, 'recruitingCount' | 'highlightGenre'>,
): string | null {
  const count = hint.recruitingCount;
  if (!Number.isFinite(count) || count <= 0) return null;

  const genre = hint.highlightGenre?.trim();
  if (genre) {
    return `同场喜欢 ${genre} 的 ${count} 人也在招募，去看看能否结伴同行。`;
  }
  return `本场有 ${count} 人正在招募，去看看能否结伴同行。`;
}
