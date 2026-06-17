export type ItineraryDjCatalogEntry = {
  id: string;
  name: string;
};

export function normalizeItineraryDjName(name: string): string {
  return name.trim().toLowerCase();
}

export function itineraryDjCardDomId(djId: string): string {
  return `dj-card-${djId}`;
}

export function resolveItineraryDjSelection(input: {
  requestedIds: string[];
  selectedDjNames?: string[];
  focusDjName?: string;
  catalog: ItineraryDjCatalogEntry[];
}): { selectedIds: string[]; focusDjId?: string } {
  const byId = new Map(input.catalog.map((dj) => [dj.id, dj]));
  const byName = new Map(
    input.catalog.map((dj) => [normalizeItineraryDjName(dj.name), dj.id]),
  );

  const selected = new Set<string>();

  for (const id of input.requestedIds) {
    const trimmed = id.trim();
    if (!trimmed) continue;
    if (byId.has(trimmed)) {
      selected.add(trimmed);
      continue;
    }
    const byRequestedName = byName.get(normalizeItineraryDjName(trimmed));
    if (byRequestedName) {
      selected.add(byRequestedName);
    }
  }

  for (const name of input.selectedDjNames ?? []) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const resolved = byName.get(normalizeItineraryDjName(trimmed));
    if (resolved) {
      selected.add(resolved);
    }
  }

  let focusDjId: string | undefined;
  const focusName = input.focusDjName?.trim();
  if (focusName) {
    focusDjId = byName.get(normalizeItineraryDjName(focusName));
    if (focusDjId) {
      selected.add(focusDjId);
    }
  }

  if (!focusDjId) {
    focusDjId = [...selected][0];
  }

  return {
    selectedIds: [...selected],
    focusDjId,
  };
}
