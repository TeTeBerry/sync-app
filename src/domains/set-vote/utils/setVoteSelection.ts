const MAX_SET_VOTE_SELECTION = 3;

export function toggleSetVoteSelection(
  selectedIds: string[],
  artistId: string,
  maxSelection = MAX_SET_VOTE_SELECTION,
): { next: string[]; rejected: boolean } {
  const index = selectedIds.indexOf(artistId);
  if (index >= 0) {
    return {
      next: selectedIds.filter((id) => id !== artistId),
      rejected: false,
    };
  }
  if (selectedIds.length >= maxSelection) {
    return { next: selectedIds, rejected: true };
  }
  return { next: [...selectedIds, artistId], rejected: false };
}

export { MAX_SET_VOTE_SELECTION };
