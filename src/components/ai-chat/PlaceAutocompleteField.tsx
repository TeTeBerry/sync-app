import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from '../icons';
import {
  fetchTravelGuidePlaceSuggestions,
  type TravelGuidePlaceSuggestion,
} from '../../api/sync/travelGuide';
import {
  departureCityFromSuggestion,
  departureDisplayValue,
  mapPlaceSuggestionsToDepartureItems,
  suggestionRegionForKeyword,
  type DepartureSuggestionItem,
} from '../../utils/travelGuideDepartureSuggestions';
import { Input, ScrollView, Text, View } from '@tarojs/components';

export type PlaceAutocompleteFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Activity host city — biases POI suggestions when keyword is empty. */
  eventCity?: string;
  /** Parent sheet/dialog visibility — pauses fetching when false. */
  active?: boolean;
  label?: string;
  labelClassName?: string;
  hint?: string;
};

export function PlaceAutocompleteField({
  value,
  onChange,
  placeholder,
  eventCity,
  active = true,
  label,
  labelClassName = 's-ai-guide-plan-sheet__label',
  hint,
}: PlaceAutocompleteFieldProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [regionCity, setRegionCity] = useState<string | undefined>();
  const [placeSuggestions, setPlaceSuggestions] = useState<
    TravelGuidePlaceSuggestion[]
  >([]);
  const pickingSuggestionRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setShowSuggestions(false);
      setPlaceSuggestions([]);
      setRegionCity(undefined);
    }
  }, [active]);

  useEffect(() => {
    if (!active || !showSuggestions) {
      setPlaceSuggestions([]);
      return;
    }
    const q = value.trim();
    const region = suggestionRegionForKeyword(q, {
      departureCity: regionCity,
      eventCity,
    });
    const timer = setTimeout(
      () => {
        void fetchTravelGuidePlaceSuggestions(q, region)
          .then((res) => {
            setPlaceSuggestions(res.data ?? []);
          })
          .catch(() => setPlaceSuggestions([]));
      },
      q ? 280 : 0,
    );
    return () => clearTimeout(timer);
  }, [active, eventCity, regionCity, showSuggestions, value]);

  const suggestions = useMemo(
    (): DepartureSuggestionItem[] =>
      mapPlaceSuggestionsToDepartureItems(placeSuggestions),
    [placeSuggestions],
  );

  const pickSuggestion = useCallback(
    (item: DepartureSuggestionItem) => {
      pickingSuggestionRef.current = true;
      onChange(departureDisplayValue(item));
      setRegionCity(departureCityFromSuggestion(item));
      setPlaceSuggestions([]);
      setShowSuggestions(false);
      setTimeout(() => {
        pickingSuggestionRef.current = false;
      }, 400);
    },
    [onChange],
  );

  return (
    <View className="s-ai-guide-plan-sheet__field">
      {label ? <Text className={labelClassName}>{label}</Text> : null}
      {hint ? <Text className="s-ai-guide-plan-sheet__hint">{hint}</Text> : null}
      <View className="s-ai-guide-plan-sheet__input-wrap">
        <MapPin size={18} className="s-ai-guide-plan-sheet__input-icon" aria-hidden />
        <Input
          className="s-ai-guide-plan-sheet__input"
          type="text"
          value={value}
          placeholder={placeholder}
          placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
          confirmType="done"
          onFocus={() => setShowSuggestions(true)}
          onInput={(e) => {
            if (pickingSuggestionRef.current) return;
            onChange(e.detail.value ?? '');
            setRegionCity(undefined);
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
                {item.kind === 'city' ? `${item.label}（城市）` : item.label}
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
