import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AiGuidePlanFormValues,
  TravelGuideBudgetTier,
} from '../../types/travelGuide';
import { normalizeDepartureForSubmit } from '../../utils/travelGuideDepartureSuggestions';

type UseAiGuidePlanSheetFormOptions = {
  open: boolean;
  defaultNights: number;
  initialValues?: AiGuidePlanFormValues | null;
  onSubmit: (values: AiGuidePlanFormValues) => void;
};

export function useAiGuidePlanSheetForm({
  open,
  defaultNights,
  initialValues,
  onSubmit,
}: UseAiGuidePlanSheetFormOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [departure, setDeparture] = useState('');
  const [departureCity, setDepartureCity] = useState<string | undefined>();
  const [headcount, setHeadcount] = useState(2);
  const [accommodationNights, setAccommodationNights] = useState(defaultNights);
  const [budgetTier, setBudgetTier] = useState<TravelGuideBudgetTier>('standard');
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
      setBudgetTier(initialValues.budgetTier);
      setSelfDrive(Boolean(initialValues.selfDrive));
      return;
    }

    setDeparture('');
    setDepartureCity(undefined);
    setHeadcount(2);
    setAccommodationNights(defaultNights);
    setBudgetTier('standard');
    setSelfDrive(false);
  }, [defaultNights, initialValues, open]);

  const canSubmit = Boolean(departure.trim());

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      departure: normalizeDepartureForSubmit(departure),
      departureCity: departureCity?.trim() || undefined,
      headcount,
      budgetTier,
      selfDrive,
      accommodationNights,
    });
  }, [
    accommodationNights,
    budgetTier,
    canSubmit,
    departure,
    departureCity,
    headcount,
    onSubmit,
    selfDrive,
  ]);

  return {
    scrollTop,
    departure,
    departureCity,
    headcount,
    accommodationNights,
    budgetTier,
    selfDrive,
    canSubmit,
    setDeparture,
    setDepartureCity,
    setHeadcount,
    setAccommodationNights,
    setBudgetTier,
    setSelfDrive,
    handleSubmit,
  };
}
