import { useCallback, useEffect, useRef, useState } from 'react';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import { normalizeDepartureForSubmit } from '../../utils/travelGuideDepartureSuggestions';

type UseAiGuidePlanSheetFormOptions = {
  open: boolean;
  defaultNights: number;
  showSelfDriveOption?: boolean;
  /** 国内活动：可选是否住宿，关闭时不生成住宿与酒店预算 */
  showAccommodationOption?: boolean;
  initialValues?: AiGuidePlanFormValues | null;
  onSubmit: (values: AiGuidePlanFormValues) => void;
};

export function useAiGuidePlanSheetForm({
  open,
  defaultNights,
  showSelfDriveOption = true,
  showAccommodationOption = false,
  initialValues,
  onSubmit,
}: UseAiGuidePlanSheetFormOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [departure, setDeparture] = useState('');
  const [departureCity, setDepartureCity] = useState<string | undefined>();
  const [headcount, setHeadcount] = useState(2);
  const [accommodationNights, setAccommodationNights] = useState(defaultNights);
  const [needsAccommodation, setNeedsAccommodation] = useState(
    !showAccommodationOption,
  );
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
      setDeparture(initialValues.departure);
      setDepartureCity(initialValues.departureCity);
      setHeadcount(initialValues.headcount);
      setAccommodationNights(
        initialValues.accommodationNights > 0
          ? initialValues.accommodationNights
          : defaultNights,
      );
      setNeedsAccommodation(
        showAccommodationOption ? initialValues.accommodationNights > 0 : true,
      );
      setSelfDrive(showSelfDriveOption ? Boolean(initialValues.selfDrive) : false);
      return;
    }

    setDeparture('');
    setDepartureCity(undefined);
    setHeadcount(2);
    setAccommodationNights(defaultNights);
    setNeedsAccommodation(!showAccommodationOption);
    setSelfDrive(false);
  }, [
    defaultNights,
    initialValues,
    open,
    showAccommodationOption,
    showSelfDriveOption,
  ]);

  const canSubmit = Boolean(departure.trim());
  const resolvedAccommodationNights =
    showAccommodationOption && !needsAccommodation ? 0 : accommodationNights;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      departure: normalizeDepartureForSubmit(departure),
      departureCity: departureCity?.trim() || undefined,
      headcount,
      ...(showSelfDriveOption && selfDrive ? { selfDrive: true } : {}),
      accommodationNights: resolvedAccommodationNights,
    });
  }, [
    canSubmit,
    departure,
    departureCity,
    headcount,
    onSubmit,
    resolvedAccommodationNights,
    selfDrive,
    showSelfDriveOption,
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
