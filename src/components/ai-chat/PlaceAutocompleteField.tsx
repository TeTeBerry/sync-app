import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from '../icons';
import {
  fetchTravelGuidePlaceSuggestions,
  type TravelGuidePlaceSuggestion,
} from '../../api/sync/travelGuide';
import {
  departureCityFromSuggestion,
  departureDisplayValue,
  localDepartureCitySuggestionItems,
  mapPlaceSuggestionsToDepartureItems,
  mergeDepartureSuggestionItems,
  suggestionRegionForKeyword,
  type DepartureSuggestionItem,
} from '../../utils/travelGuideDepartureSuggestions';
import { useT } from '@/hooks/useI18n';
import { Input, ScrollView, Text, View } from '@tarojs/components';

const REMOTE_DEBOUNCE_MS = 150;

export type PlaceAutocompleteFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called when user picks a suggestion or clears the city anchor by typing. */
  onCityChange?: (city: string | undefined) => void;
  placeholder: string;
  /** Activity host city — biases POI suggestions when keyword is empty. */
  eventCity?: string;
  /** Parent sheet/dialog visibility — pauses fetching when false. */
  active?: boolean;
  label?: string;
  labelClassName?: string;
  hint?: string;
  /** When true, only POI suggestions are shown (no city rows). */
  placesOnly?: boolean;
};

export function PlaceAutocompleteField({
  value,
  onChange,
  onCityChange,
  placeholder,
  eventCity,
  active = true,
  label,
  labelClassName = 's-ai-guide-plan-sheet__label',
  hint,
  placesOnly = false,
}: PlaceAutocompleteFieldProps) {
  const t = useT();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [regionCity, setRegionCity] = useState<string | undefined>();
  const [remoteSuggestions, setRemoteSuggestions] = useState<DepartureSuggestionItem[]>(
    [],
  );
  const pickingSuggestionRef = useRef(false);
  const remoteRequestIdRef = useRef(0);

  const query = value.trim();

  const localSuggestions = useMemo(
    () => localDepartureCitySuggestionItems(query),
    [query],
  );

  useEffect(() => {
    if (!active) {
      setShowSuggestions(false);
      setRemoteSuggestions([]);
      setRegionCity(undefined);
    }
  }, [active]);

  useEffect(() => {
    if (!active || !showSuggestions) {
      setRemoteSuggestions([]);
      return;
    }

    const region = suggestionRegionForKeyword(query, {
      departureCity: regionCity,
      eventCity,
    });
    const requestId = ++remoteRequestIdRef.current;
    const timer = setTimeout(() => {
      void fetchTravelGuidePlaceSuggestions(query, region)
        .then((res) => {
          if (remoteRequestIdRef.current !== requestId) return;
          const remote = mapPlaceSuggestionsToDepartureItems(
            (res.data ?? []) as TravelGuidePlaceSuggestion[],
          );
          setRemoteSuggestions(remote);
        })
        .catch(() => {
          if (remoteRequestIdRef.current !== requestId) return;
          setRemoteSuggestions([]);
        });
    }, REMOTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [active, eventCity, query, regionCity, showSuggestions]);

  const suggestions = useMemo((): DepartureSuggestionItem[] => {
    const merged = mergeDepartureSuggestionItems(localSuggestions, remoteSuggestions);
    return placesOnly ? merged.filter((item) => item.kind === 'place') : merged;
  }, [localSuggestions, placesOnly, remoteSuggestions]);

  const pickSuggestion = useCallback(
    (item: DepartureSuggestionItem) => {
      pickingSuggestionRef.current = true;
      const city = departureCityFromSuggestion(item);
      onChange(departureDisplayValue(item));
      setRegionCity(city);
      onCityChange?.(city);
      setRemoteSuggestions([]);
      setShowSuggestions(false);
      setTimeout(() => {
        pickingSuggestionRef.current = false;
      }, 400);
    },
    [onChange, onCityChange],
  );

  return (
    <View className="s-ai-guide-plan-sheet__field">
      {label ? <Text className={labelClassName}>{label}</Text> : null}
      {hint ? <Text className="s-ai-guide-plan-sheet__hint">{hint}</Text> : null}
      <View className="s-ai-guide-plan-sheet__input-wrap">
        <View className="s-ai-guide-plan-sheet__input-icon-wrap" aria-hidden>
          <MapPin
            size={16}
            className="s-ai-guide-plan-sheet__input-icon"
            color="#4cc9f0"
          />
        </View>
        <Input
          className="s-ai-guide-plan-sheet__input"
          type="text"
          value={value}
          placeholder={placeholder}
          placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
          confirmType="done"
          holdKeyboard={process.env.TARO_ENV === 'weapp'}
          adjustPosition={false}
          onFocus={() => setShowSuggestions(true)}
          onInput={(e) => {
            if (pickingSuggestionRef.current) return;
            onChange(e.detail.value ?? '');
            setRegionCity(undefined);
            onCityChange?.(undefined);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              if (pickingSuggestionRef.current) return;
              setShowSuggestions(false);
            }, 320);
          }}
        />
      </View>
      {showSuggestions && suggestions.length > 0 ? (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-ai-guide-plan-sheet__suggest-list s-scrollbar-none"
        >
          {suggestions.map((item) => (
            <View
              key={`${item.kind}-${item.label}-${item.address ?? ''}`}
              className="s-ai-guide-plan-sheet__suggest-item"
              hoverClass="s-ai-guide-plan-sheet__suggest-item--pressed"
              hoverStayTime={80}
              onTap={() => pickSuggestion(item)}
            >
              <Text className="s-ai-guide-plan-sheet__suggest-title">
                {item.kind === 'city'
                  ? t('ai.placeAutocompleteCity', { label: item.label })
                  : item.label}
              </Text>
              {item.kind === 'place' && item.address && item.address !== item.label ? (
                <Text className="s-ai-guide-plan-sheet__suggest-meta s-line-clamp-2">
                  {item.address}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
