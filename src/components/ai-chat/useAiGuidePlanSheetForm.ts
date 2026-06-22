import { useCallback, useEffect, useRef, useState } from 'react';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import { normalizeDepartureForSubmit } from '../../utils/travelGuideDepartureSuggestions';

type UseAiGuidePlanSheetFormOptions = {
  open: boolean;
  defaultNights: number;
  showSelfDriveOption?: boolean;
  initialValues?: AiGuidePlanFormValues | null;
  onSubmit: (values: AiGuidePlanFormValues) => void;
};

export function useAiGuidePlanSheetForm({
  open,
  defaultNights,
  showSelfDriveOption = true,
  initialValues,
  onSubmit,
}: UseAiGuidePlanSheetFormOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [departure, setDeparture] = useState('');
  const [departureCity, setDepartureCity] = useState<string | undefined>();
  const [headcount, setHeadcount] = useState(2);
  const [accommodationNights, setAccommodationNights] = useState(defaultNights);
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
      setAccommodationNights(initialValues.accommodationNights);
      setSelfDrive(showSelfDriveOption ? Boolean(initialValues.selfDrive) : false);
      return;
    }

    setDeparture('');
    setDepartureCity(undefined);
    setHeadcount(2);
    setAccommodationNights(defaultNights);
    setSelfDrive(false);
  }, [defaultNights, initialValues, open, showSelfDriveOption]);

  const canSubmit = Boolean(departure.trim());

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      departure: normalizeDepartureForSubmit(departure),
      departureCity: departureCity?.trim() || undefined,
      headcount,
      ...(showSelfDriveOption && selfDrive ? { selfDrive: true } : {}),
      accommodationNights,
    });
  }, [
    accommodationNights,
    canSubmit,
    departure,
    departureCity,
    headcount,
    onSubmit,
    selfDrive,
    showSelfDriveOption,
  ]);

  return {
    scrollTop,
    departure,
    departureCity,
    headcount,
    accommodationNights,
    selfDrive,
    canSubmit,
    setDeparture,
    setDepartureCity,
    setHeadcount,
    setAccommodationNights,
    setSelfDrive,
    handleSubmit,
  };
}
