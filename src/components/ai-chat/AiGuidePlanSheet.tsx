import './AiGuidePlanSheet.scss';
import { memo, useCallback } from 'react';
import {
  BedDouble,
  Car,
  Minus,
  Plus,
  Sparkles,
  Users,
  X,
} from '../../components/icons';
import { Button, cn } from '../ui';
import { getGenerateTravelGuideCta } from '../../constants/aiCtaLabels';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import { TRAVEL_GUIDE_BUDGET_OPTIONS } from '../../types/travelGuide';
import { PlaceAutocompleteField } from './PlaceAutocompleteField';
import { useAiGuidePlanSheetForm } from './useAiGuidePlanSheetForm';
import { ScrollView, Text, View } from '@tarojs/components';

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

function AiGuidePlanSheetInner({
  open,
  defaultNights,
  eventCity,
  initialValues,
  onClose,
  onSubmit,
}: AiGuidePlanSheetProps) {
  useOverlayLock(open);

  const form = useAiGuidePlanSheetForm({
    open,
    defaultNights,
    initialValues,
    onSubmit,
  });
  const {
    setDeparture,
    setDepartureCity,
    setAccommodationNights,
    setBudgetTier,
    setSelfDrive,
  } = form;

  const handleDepartureChange = useCallback(
    (value: string) => {
      setDeparture(value);
    },
    [setDeparture],
  );

  const handleDepartureCityChange = useCallback(
    (city: string | undefined) => {
      setDepartureCity(city);
    },
    [setDepartureCity],
  );

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
              {getGenerateTravelGuideCta()}
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

        <View className="s-ai-guide-plan-sheet__body-outer">
          <PlaceAutocompleteField
            label="出发地"
            hint="跨城填出发城市（如「上海」）；同城可填公司、车站等具体地点"
            value={form.departure}
            onChange={handleDepartureChange}
            onCityChange={handleDepartureCityChange}
            placeholder="请输入出发地址"
            eventCity={eventCity}
            active={open}
          />
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={form.scrollTop}
          className="s-ai-guide-plan-sheet__scroll s-scrollbar-none"
          style={{ flex: 1, height: 0, minHeight: 0 }}
        >
          <View className="s-ai-guide-plan-sheet__body">
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
                      {form.headcount} 人
                    </Text>
                  </View>
                  <InlineStepper
                    value={form.headcount}
                    min={1}
                    max={10}
                    onChange={form.setHeadcount}
                  />
                </View>
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-guide-plan-sheet__label">住宿预算 / 晚</Text>
              <View className="s-ai-guide-plan-sheet__budget-row">
                {TRAVEL_GUIDE_BUDGET_OPTIONS.map((opt) => {
                  const active = form.budgetTier === opt.id;
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
                  checked={form.selfDrive}
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
                      {form.accommodationNights} 晚
                    </Text>
                  </View>
                  <InlineStepper
                    value={form.accommodationNights}
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
              !form.canSubmit && 's-ai-guide-plan-sheet__submit--disabled',
            )}
            disabled={!form.canSubmit}
            hoverClass={form.canSubmit ? 's-ai-guide-plan-sheet__submit--pressed' : ''}
            onClick={form.handleSubmit}
          >
            <Sparkles size={18} color="#fff" aria-hidden />
            <Text className="s-ai-guide-plan-sheet__submit-text">
              {getGenerateTravelGuideCta()}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

export const AiGuidePlanSheet = memo(AiGuidePlanSheetInner);
