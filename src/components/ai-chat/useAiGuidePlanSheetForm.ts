import { useCallback, useEffect, useRef, useState } from 'react';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import {
  normalizeDepartureForSubmit,
  resolveDepartureCityForSubmit,
} from '../../utils/travelGuideDepartureSuggestions';
import { resolveTravelGuideBudgetTier } from '@/domains/travel-guide/utils/travelGuideBudgetLabels';
import { normalizeAiGuidePlanFormValues } from '@/utils/normalizeUserProfileText';

export function resolveGuidePlanAccommodationNights(
  showDomesticGuideOptions: boolean,
  needsAccommodation: boolean,
  accommodationNights: number,
): number {
  return showDomesticGuideOptions && !needsAccommodation ? 0 : accommodationNights;
}

type UseAiGuidePlanSheetFormOptions = {
  open: boolean;
  defaultNights: number;
  /** 国内活动：展示自驾 / 住宿开关；关闭住宿时不生成酒店与预算 */
  showDomesticGuideOptions?: boolean;
  initialValues?: AiGuidePlanFormValues | null;
  /** 重新生成：跳过服务端缓存并强制完整 pipeline */
  forceRegenerate?: boolean;
  onSubmit: (values: AiGuidePlanFormValues) => void;
};

export function useAiGuidePlanSheetForm({
  open,
  defaultNights,
  showDomesticGuideOptions = false,
  initialValues,
  forceRegenerate = false,
  onSubmit,
}: UseAiGuidePlanSheetFormOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [departure, setDeparture] = useState('');
  const [departureCity, setDepartureCity] = useState<string | undefined>();
  const [headcount, setHeadcount] = useState(2);
  const [accommodationNights, setAccommodationNights] = useState(defaultNights);
  const [needsAccommodation, setNeedsAccommodation] = useState(true);
  const [selfDrive, setSelfDrive] = useState(false);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;
    if (!open || !justOpened) {
      return;
    }

    setScrollTop(0);
    if (initialValues) {
      const normalized = normalizeAiGuidePlanFormValues(initialValues);
      setDeparture(normalized.departure);
      setDepartureCity(normalized.departureCity);
      setHeadcount(normalized.headcount);
      const nights = normalized.accommodationNights ?? defaultNights;
      setAccommodationNights(nights > 0 ? nights : defaultNights);
      setNeedsAccommodation(
        showDomesticGuideOptions ? (normalized.accommodationNights ?? 0) > 0 : true,
      );
      setSelfDrive(showDomesticGuideOptions ? Boolean(normalized.selfDrive) : false);
      return;
    }

    setDeparture('');
    setDepartureCity(undefined);
    setHeadcount(2);
    setAccommodationNights(defaultNights);
    setNeedsAccommodation(true);
    setSelfDrive(false);
  }, [defaultNights, initialValues, open, showDomesticGuideOptions]);

  const canSubmit = Boolean(departure.trim());
  const resolvedAccommodationNights = resolveGuidePlanAccommodationNights(
    showDomesticGuideOptions,
    needsAccommodation,
    accommodationNights,
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const normalizedDeparture = normalizeDepartureForSubmit(departure);
    onSubmit({
      departure: normalizedDeparture,
      departureCity: resolveDepartureCityForSubmit(normalizedDeparture, departureCity),
      headcount,
      budgetTier: resolveTravelGuideBudgetTier(initialValues?.budgetTier),
      ...(showDomesticGuideOptions ? { selfDrive: Boolean(selfDrive) } : {}),
      accommodationNights: resolvedAccommodationNights,
      ...(forceRegenerate ? { forceRegenerate: true } : {}),
    });
  }, [
    canSubmit,
    departure,
    departureCity,
    forceRegenerate,
    headcount,
    initialValues,
    onSubmit,
    resolvedAccommodationNights,
    selfDrive,
    showDomesticGuideOptions,
  ]);

  return {
    scrollTop,
    departure,
    departureCity,
    headcount,
    accommodationNights,
    needsAccommodation,
    selfDrive,
    canSubmit,
    setDeparture,
    setDepartureCity,
    setHeadcount,
    setAccommodationNights,
    setNeedsAccommodation,
    setSelfDrive,
    handleSubmit,
  };
}
