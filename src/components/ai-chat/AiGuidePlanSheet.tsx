import './AiGuidePlanSheet.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BedDouble,
  Car,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Users,
  X,
} from '../../components/icons';
import { Button, cn } from '../ui';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import {
  fetchTravelGuidePlaceSuggestions,
  type TravelGuidePlaceSuggestion,
} from '../../api/sync/travelGuide';
import {
  departureCityFromSuggestion,
  departureDisplayValue,
  mapPlaceSuggestionsToDepartureItems,
  normalizeDepartureForSubmit,
  suggestionRegionForKeyword,
  type DepartureSuggestionItem,
} from '../../utils/travelGuideDepartureSuggestions';
import type {
  AiGuidePlanFormValues,
  TravelGuideBudgetTier,
} from '../../types/travelGuide';
import { TRAVEL_GUIDE_BUDGET_OPTIONS } from '../../types/travelGuide';
import { Input, ScrollView, Text, View } from '@tarojs/components';

export type AiGuidePlanSheetProps = {
  open: boolean;
  defaultNights: number;
  /** 活动举办城市，用于未指定出发城市时的 POI 区域约束 */
  eventCity?: string;
  initialValues?: AiGuidePlanFormValues | null;
  onClose: () => void;
  onSubmit: (values: AiGuidePlanFormValues) => void;
};

function InlineStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <View className="s-ai-guide-plan-sheet__inline-stepper">
      <Button
        className="s-ai-guide-plan-sheet__inline-stepper-btn"
        disabled={value <= min}
        hoverClass="s-ai-guide-plan-sheet__inline-stepper-btn--pressed"
        aria-label="减少"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} color="#fff" aria-hidden />
      </Button>
      <Text className="s-ai-guide-plan-sheet__inline-stepper-value">{value}</Text>
      <Button
        className="s-ai-guide-plan-sheet__inline-stepper-btn"
        disabled={value >= max}
        hoverClass="s-ai-guide-plan-sheet__inline-stepper-btn--pressed"
        aria-label="增加"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} color="#fff" aria-hidden />
      </Button>
    </View>
  );
}

function ThemeToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <Button
      className={cn(
        's-ai-guide-plan-sheet__toggle',
        checked && 's-ai-guide-plan-sheet__toggle--on',
      )}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      hoverClass="s-ai-guide-plan-sheet__toggle--pressed"
      onClick={() => onChange(!checked)}
    >
      <View className="s-ai-guide-plan-sheet__toggle-knob" aria-hidden />
    </Button>
  );
}

export function AiGuidePlanSheet({
  open,
  defaultNights,
  eventCity,
  initialValues,
  onClose,
  onSubmit,
}: AiGuidePlanSheetProps) {
  useOverlayLock(open);

  const [scrollTop, setScrollTop] = useState(0);
  const [departure, setDeparture] = useState('');
  const [departureCity, setDepartureCity] = useState<string | undefined>();
  const [headcount, setHeadcount] = useState(2);
  const [accommodationNights, setAccommodationNights] = useState(defaultNights);
  const [budgetTier, setBudgetTier] = useState<TravelGuideBudgetTier>('standard');
  const [selfDrive, setSelfDrive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<
    TravelGuidePlaceSuggestion[]
  >([]);
  const pickingSuggestionRef = useRef(false);

  useEffect(() => {
    if (!open) return;
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

  useEffect(() => {
    if (!open || !showSuggestions) {
      setPlaceSuggestions([]);
      return;
    }
    const q = departure.trim();
    const region = suggestionRegionForKeyword(q, {
      departureCity,
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
  }, [departure, departureCity, eventCity, open, showSuggestions]);

  const departureSuggestions = useMemo(
    (): DepartureSuggestionItem[] =>
      mapPlaceSuggestionsToDepartureItems(placeSuggestions),
    [placeSuggestions],
  );

  const canSubmit = Boolean(departure.trim());

  const pickSuggestion = useCallback((item: DepartureSuggestionItem) => {
    pickingSuggestionRef.current = true;
    setDeparture(departureDisplayValue(item));
    setDepartureCity(departureCityFromSuggestion(item));
    setPlaceSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => {
      pickingSuggestionRef.current = false;
    }, 400);
  }, []);

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

  if (!open) return null;

  return (
    <View
      className="s-overlay s-overlay--sheet s-ai-guide-plan-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-ai-guide-plan-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-guide-plan-sheet-title"
      >
        <View className="s-ai-guide-plan-sheet__handle" aria-hidden />
        <View className="s-ai-guide-plan-sheet__top">
          <View className="s-ai-guide-plan-sheet__title-row">
            <View className="s-ai-guide-plan-sheet__title-icon" aria-hidden>
              <Sparkles
                size={16}
                className="s-ai-guide-plan-sheet__title-icon-sparkle"
                color="#ff0066"
                aria-hidden
              />
            </View>
            <Text
              id="ai-guide-plan-sheet-title"
              className="s-ai-guide-plan-sheet__title"
            >
              AI出行攻略
            </Text>
            <Text className="s-ai-guide-plan-sheet__beta">Beta</Text>
          </View>
          <Button
            className="s-ai-guide-plan-sheet__close"
            hoverClass="s-ai-guide-plan-sheet__close--pressed"
            aria-label="关闭"
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={scrollTop}
          className="s-ai-guide-plan-sheet__scroll s-scrollbar-none"
        >
          <View className="s-ai-guide-plan-sheet__body">
            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-guide-plan-sheet__label">出发地</Text>
              <Text className="s-ai-guide-plan-sheet__hint">
                跨城填出发城市（如「上海」）；同城可填公司、车站等具体地点
              </Text>
              <View className="s-ai-guide-plan-sheet__input-wrap">
                <MapPin
                  size={18}
                  className="s-ai-guide-plan-sheet__input-icon"
                  aria-hidden
                />
                <Input
                  className="s-ai-guide-plan-sheet__input"
                  type="text"
                  value={departure}
                  placeholder="请输入出发地址"
                  placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
                  confirmType="done"
                  onFocus={() => setShowSuggestions(true)}
                  onInput={(e) => {
                    if (pickingSuggestionRef.current) return;
                    setDeparture(e.detail.value ?? '');
                    setDepartureCity(undefined);
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
              {showSuggestions && departureSuggestions.length > 0 ? (
                <ScrollView
                  scrollY
                  enhanced
                  showScrollbar={false}
                  className="s-ai-guide-plan-sheet__suggest-list s-scrollbar-none"
                  catchMove
                >
                  {departureSuggestions.map((item) => (
                    <View
                      key={`${item.kind}-${item.label}-${item.address ?? ''}`}
                      className="s-ai-guide-plan-sheet__suggest-item"
                      hoverClass="s-ai-guide-plan-sheet__suggest-item--pressed"
                      hoverStayTime={80}
                      onTouchStart={() => pickSuggestion(item)}
                    >
                      <Text className="s-ai-guide-plan-sheet__suggest-title">
                        {item.kind === 'city' ? `${item.label}（城市）` : item.label}
                      </Text>
                      {item.kind === 'place' &&
                      item.address &&
                      item.address !== item.label ? (
                        <Text className="s-ai-guide-plan-sheet__suggest-meta s-line-clamp-2">
                          {item.address}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              ) : null}
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-guide-plan-sheet__label">出行人数</Text>
              <View className="s-ai-guide-plan-sheet__card">
                <View className="s-ai-guide-plan-sheet__card-row">
                  <View className="s-ai-guide-plan-sheet__card-summary">
                    <Users
                      size={18}
                      className="s-ai-guide-plan-sheet__card-icon"
                      aria-hidden
                    />
                    <Text className="s-ai-guide-plan-sheet__card-summary-text">
                      {headcount} 人
                    </Text>
                  </View>
                  <InlineStepper
                    value={headcount}
                    min={1}
                    max={10}
                    onChange={setHeadcount}
                  />
                </View>
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-guide-plan-sheet__label">住宿预算 / 晚</Text>
              <View className="s-ai-guide-plan-sheet__budget-row">
                {TRAVEL_GUIDE_BUDGET_OPTIONS.map((opt) => {
                  const active = budgetTier === opt.id;
                  return (
                    <Button
                      key={opt.id}
                      className={cn(
                        's-ai-guide-plan-sheet__budget',
                        active && `s-ai-guide-plan-sheet__budget--on-${opt.id}`,
                      )}
                      hoverClass="s-ai-guide-plan-sheet__budget--pressed"
                      onClick={() => setBudgetTier(opt.id)}
                    >
                      <Text className="s-ai-guide-plan-sheet__budget-label">
                        {opt.label}
                      </Text>
                      <Text className="s-ai-guide-plan-sheet__budget-hint">
                        {opt.hint}
                      </Text>
                    </Button>
                  );
                })}
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__card s-ai-guide-plan-sheet__card--drive">
              <View className="s-ai-guide-plan-sheet__card-row">
                <View className="s-ai-guide-plan-sheet__drive-copy">
                  <Car
                    size={18}
                    className="s-ai-guide-plan-sheet__card-icon"
                    aria-hidden
                  />
                  <View className="s-ai-guide-plan-sheet__drive-text">
                    <Text className="s-ai-guide-plan-sheet__drive-title">是否自驾</Text>
                    <Text className="s-ai-guide-plan-sheet__drive-hint">
                      影响交通路线推荐
                    </Text>
                  </View>
                </View>
                <ThemeToggle
                  checked={selfDrive}
                  ariaLabel="是否自驾"
                  onChange={setSelfDrive}
                />
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-guide-plan-sheet__label">住宿天数</Text>
              <View className="s-ai-guide-plan-sheet__card">
                <View className="s-ai-guide-plan-sheet__card-row">
                  <View className="s-ai-guide-plan-sheet__card-summary">
                    <BedDouble
                      size={18}
                      className="s-ai-guide-plan-sheet__card-icon"
                      aria-hidden
                    />
                    <Text className="s-ai-guide-plan-sheet__card-summary-text">
                      {accommodationNights} 晚
                    </Text>
                  </View>
                  <InlineStepper
                    value={accommodationNights}
                    min={1}
                    max={7}
                    onChange={setAccommodationNights}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="s-ai-guide-plan-sheet__footer">
          <Button
            className={cn(
              's-ai-guide-plan-sheet__submit',
              !canSubmit && 's-ai-guide-plan-sheet__submit--disabled',
            )}
            disabled={!canSubmit}
            hoverClass={canSubmit ? 's-ai-guide-plan-sheet__submit--pressed' : ''}
            onClick={handleSubmit}
          >
            <Sparkles size={18} color="#fff" aria-hidden />
            <Text className="s-ai-guide-plan-sheet__submit-text">生成 AI 攻略</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
