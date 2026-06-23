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
import { PlaceAutocompleteField } from './PlaceAutocompleteField';
import { useAiGuidePlanSheetForm } from './useAiGuidePlanSheetForm';
import { useT } from '@/hooks/useI18n';
import { ScrollView, Text, View } from '@tarojs/components';

export type AiGuidePlanSheetProps = {
  open: boolean;
  defaultNights: number;
  /** Activity host city, used for POI area constraints when departure city is not specified */
  eventCity?: string;
  /** 海外活动不展示自驾选项 */
  showSelfDriveOption?: boolean;
  /** 国内活动展示「是否住宿」开关，关闭时不生成住宿方案 */
  showAccommodationOption?: boolean;
  initialValues?: AiGuidePlanFormValues | null;
  onClose: () => void;
  onSubmit: (values: AiGuidePlanFormValues) => void;
};

function InlineStepper({
  value,
  min,
  max,
  onChange,
  ariaDecrease,
  ariaIncrease,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  ariaDecrease: string;
  ariaIncrease: string;
}) {
  return (
    <View className="s-ai-guide-plan-sheet__inline-stepper">
      <Button
        className="s-ai-guide-plan-sheet__inline-stepper-btn"
        disabled={value <= min}
        hoverClass="s-ai-guide-plan-sheet__inline-stepper-btn--pressed"
        aria-label={ariaDecrease}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={15} color="rgba(255,255,255,0.9)" aria-hidden />
      </Button>
      <Text className="s-ai-guide-plan-sheet__inline-stepper-value">{value}</Text>
      <Button
        className="s-ai-guide-plan-sheet__inline-stepper-btn"
        disabled={value >= max}
        hoverClass="s-ai-guide-plan-sheet__inline-stepper-btn--pressed"
        aria-label={ariaIncrease}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={15} color="rgba(255,255,255,0.9)" aria-hidden />
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
  showSelfDriveOption = true,
  showAccommodationOption = false,
  initialValues,
  onClose,
  onSubmit,
}: AiGuidePlanSheetProps) {
  const t = useT();
  useOverlayLock(open);

  const form = useAiGuidePlanSheetForm({
    open,
    defaultNights,
    initialValues,
    showSelfDriveOption,
    showAccommodationOption,
    onSubmit,
  });
  const {
    setDeparture,
    setDepartureCity,
    setAccommodationNights,
    setNeedsAccommodation,
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
                color="#fff"
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
            aria-label={t('travelPlan.closeAria')}
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <View className="s-ai-guide-plan-sheet__body-outer">
          <PlaceAutocompleteField
            label={t('travelPlan.departureLabel')}
            hint={t('travelPlan.departureHint')}
            value={form.departure}
            onChange={handleDepartureChange}
            onCityChange={handleDepartureCityChange}
            placeholder={t('travelPlan.departurePlaceholder')}
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
        >
          <View className="s-ai-guide-plan-sheet__body">
            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-guide-plan-sheet__label">
                {t('travelPlan.headcountLabel')}
              </Text>
              <View className="s-ai-guide-plan-sheet__card">
                <View className="s-ai-guide-plan-sheet__card-row">
                  <View className="s-ai-guide-plan-sheet__card-summary">
                    <View
                      className="s-ai-guide-plan-sheet__icon-badge s-ai-guide-plan-sheet__icon-badge--muted"
                      aria-hidden
                    >
                      <Users size={16} className="s-ai-guide-plan-sheet__card-icon" />
                    </View>
                    <Text className="s-ai-guide-plan-sheet__card-summary-text">
                      {form.headcount} {t('travelPlan.headcountUnit')}
                    </Text>
                  </View>
                  <InlineStepper
                    value={form.headcount}
                    min={1}
                    max={10}
                    onChange={form.setHeadcount}
                    ariaDecrease={t('travelPlan.decreaseAria')}
                    ariaIncrease={t('travelPlan.increaseAria')}
                  />
                </View>
              </View>
            </View>

            {!showAccommodationOption || form.needsAccommodation ? (
              <Text className="s-ai-guide-plan-sheet__budget-hint-note">
                {t('travelPlan.budgetOptionalHint')}
              </Text>
            ) : null}

            {showSelfDriveOption ? (
              <View className="s-ai-guide-plan-sheet__card s-ai-guide-plan-sheet__card--drive">
                <View className="s-ai-guide-plan-sheet__card-row">
                  <View className="s-ai-guide-plan-sheet__drive-copy">
                    <View
                      className="s-ai-guide-plan-sheet__icon-badge s-ai-guide-plan-sheet__icon-badge--muted"
                      aria-hidden
                    >
                      <Car size={16} className="s-ai-guide-plan-sheet__card-icon" />
                    </View>
                    <View className="s-ai-guide-plan-sheet__drive-text">
                      <Text className="s-ai-guide-plan-sheet__drive-title">
                        {t('travelPlan.driveTitle')}
                      </Text>
                      <Text className="s-ai-guide-plan-sheet__drive-hint">
                        {t('travelPlan.driveHint')}
                      </Text>
                    </View>
                  </View>
                  <ThemeToggle
                    checked={form.selfDrive}
                    ariaLabel={t('travelPlan.driveYes')}
                    onChange={setSelfDrive}
                  />
                </View>
              </View>
            ) : null}

            {showAccommodationOption ? (
              <View className="s-ai-guide-plan-sheet__card s-ai-guide-plan-sheet__card--drive">
                <View className="s-ai-guide-plan-sheet__card-row">
                  <View className="s-ai-guide-plan-sheet__drive-copy">
                    <View
                      className="s-ai-guide-plan-sheet__icon-badge s-ai-guide-plan-sheet__icon-badge--muted"
                      aria-hidden
                    >
                      <BedDouble
                        size={16}
                        className="s-ai-guide-plan-sheet__card-icon"
                      />
                    </View>
                    <View className="s-ai-guide-plan-sheet__drive-text">
                      <Text className="s-ai-guide-plan-sheet__drive-title">
                        {t('travelPlan.accommodationTitle')}
                      </Text>
                    </View>
                  </View>
                  <ThemeToggle
                    checked={form.needsAccommodation}
                    ariaLabel={t('travelPlan.accommodationTitle')}
                    onChange={setNeedsAccommodation}
                  />
                </View>
              </View>
            ) : null}

            {!showAccommodationOption || form.needsAccommodation ? (
              <View className="s-ai-guide-plan-sheet__field">
                <Text className="s-ai-guide-plan-sheet__label">
                  {t('travelPlan.nightsLabel')}
                </Text>
                <View className="s-ai-guide-plan-sheet__card">
                  <View className="s-ai-guide-plan-sheet__card-row">
                    <View className="s-ai-guide-plan-sheet__card-summary">
                      <View
                        className="s-ai-guide-plan-sheet__icon-badge s-ai-guide-plan-sheet__icon-badge--muted"
                        aria-hidden
                      >
                        <BedDouble
                          size={16}
                          className="s-ai-guide-plan-sheet__card-icon"
                        />
                      </View>
                      <Text className="s-ai-guide-plan-sheet__card-summary-text">
                        {form.accommodationNights} {t('travelPlan.nightsUnit')}
                      </Text>
                    </View>
                    <InlineStepper
                      value={form.accommodationNights}
                      min={1}
                      max={7}
                      onChange={setAccommodationNights}
                      ariaDecrease={t('travelPlan.decreaseAria')}
                      ariaIncrease={t('travelPlan.increaseAria')}
                    />
                  </View>
                </View>
              </View>
            ) : null}
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
            <Sparkles size={17} color="#fff" aria-hidden />
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
