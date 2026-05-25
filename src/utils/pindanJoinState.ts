export type PindanJoinUiState = "join" | "joined" | "full";

export function getPindanJoinUiState(
  item: { joined: number; total: number },
  joinedIds: ReadonlySet<number>,
  legacyId: number,
): PindanJoinUiState {
  if (joinedIds.has(legacyId)) return "joined";
  if (item.joined >= item.total) return "full";
  return "join";
}

export function isPindanJoinDisabled(state: PindanJoinUiState): boolean {
  return state !== "join";
}
