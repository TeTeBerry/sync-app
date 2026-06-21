export function resolveHomeFindTeamActivityId(options: {
  activeActivityLegacyId?: number | null;
  nextSelectedEventId?: number | null;
  featuredLegacyId?: number | null;
}): number | undefined {
  const { activeActivityLegacyId, nextSelectedEventId, featuredLegacyId } = options;

  if (activeActivityLegacyId != null && !Number.isNaN(activeActivityLegacyId)) {
    return activeActivityLegacyId;
  }
  if (nextSelectedEventId != null && !Number.isNaN(nextSelectedEventId)) {
    return nextSelectedEventId;
  }
  if (featuredLegacyId != null && !Number.isNaN(featuredLegacyId)) {
    return featuredLegacyId;
  }
  return undefined;
}
