type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type FestivalPrepCollapsedHint = {
  text: string;
  actionable: boolean;
};

export function resolveFestivalPrepCollapsedHint({
  travelGuideGenerated = false,
  travelGuideSupported,
  t,
}: {
  travelGuideGenerated?: boolean;
  travelGuideSupported?: boolean;
  t: TranslateFn;
}): FestivalPrepCollapsedHint {
  if (travelGuideGenerated) {
    return {
      text: t('eventDetail.festivalPrepHintGuideGenerated'),
      actionable: true,
    };
  }

  if (travelGuideSupported === false) {
    return {
      text: t('eventDetail.festivalPrepHintGuidePreparing'),
      actionable: false,
    };
  }

  return {
    text: t('eventDetail.festivalPrepHintGuideNew'),
    actionable: true,
  };
}
