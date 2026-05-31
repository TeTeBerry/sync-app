import type { ItineraryConflict } from "../../../types/backend";

type Slot = {
  artistId: string;
  artistName: string;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  stageLabel: string;
};

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export function detectItineraryConflicts(
  slots: Slot[],
  selectedArtistIds: string[],
): ItineraryConflict[] {
  const selected = new Set(selectedArtistIds);
  const byDate = new Map<string, Slot[]>();

  for (const slot of slots) {
    if (!selected.has(slot.artistId)) continue;
    const list = byDate.get(slot.dateKey) ?? [];
    list.push(slot);
    byDate.set(slot.dateKey, list);
  }

  const conflicts: ItineraryConflict[] = [];
  const seen = new Set<string>();

  for (const [dateKey, daySlots] of byDate) {
    for (let i = 0; i < daySlots.length; i += 1) {
      for (let j = i + 1; j < daySlots.length; j += 1) {
        const a = daySlots[i];
        const b = daySlots[j];
        if (!rangesOverlap(a.startMinutes, a.endMinutes, b.startMinutes, b.endMinutes)) {
          continue;
        }
        const key = [a.artistId, b.artistId].sort().join(":") + dateKey;
        if (seen.has(key)) continue;
        seen.add(key);
        conflicts.push({
          artistIds: [a.artistId, b.artistId],
          artistNames: [a.artistName, b.artistName],
          dateKey,
          overlapStart: b.startTime,
          overlapEnd: a.endTime,
          message: `${a.artistName} 与 ${b.artistName} 演出时间重叠，建议提前规划转场。`,
        });
      }
    }
  }

  return conflicts;
}
