import './TravelPlanSplitSheet.scss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Minus, Plus, X } from '@/components/icons';
import { Button, cn } from '@/components/ui';
import { useOverlayLock } from '@/hooks/useOverlayLock';
import { useT } from '@/hooks/useI18n';
import {
  clampSplitCount,
  computeTravelPlanPerPerson,
  MAX_SPLIT_COUNT,
  MIN_SPLIT_COUNT,
} from '../utils/travelPlanSplit.util';
import { formatTravelPlanCost } from '../utils/travelPlanStats';
import { Text, View } from '@tarojs/components';

export type TravelPlanSplitConfirmValues = {
  splitEnabled: boolean;
  splitCount: number;
};

export type TravelPlanSplitSheetProps = {
  open: boolean;
  defaultSplitCount: number;
  defaultSplitEnabled?: boolean;
  totalAmount: number;
  onClose: () => void;
  onConfirm: (values: TravelPlanSplitConfirmValues) => void;
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
    <View className="s-travel-plan-split-sheet__stepper">
      <Button
        className="s-travel-plan-split-sheet__stepper-btn"
        disabled={value <= min}
        hoverClass="s-travel-plan-split-sheet__stepper-btn--pressed"
        aria-label={ariaDecrease}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={15} color="rgba(255,255,255,0.9)" aria-hidden />
      </Button>
      <Text className="s-travel-plan-split-sheet__stepper-value">{value}</Text>
      <Button
        className="s-travel-plan-split-sheet__stepper-btn"
        disabled={value >= max}
        hoverClass="s-travel-plan-split-sheet__stepper-btn--pressed"
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
        's-travel-plan-split-sheet__toggle',
        checked && 's-travel-plan-split-sheet__toggle--on',
      )}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      hoverClass="s-travel-plan-split-sheet__toggle--pressed"
      onClick={() => onChange(!checked)}
    >
      <View className="s-travel-plan-split-sheet__toggle-knob" aria-hidden />
    </Button>
  );
}

export function TravelPlanSplitSheet({
  open,
  defaultSplitCount,
  defaultSplitEnabled = true,
  totalAmount,
  onClose,
  onConfirm,
}: TravelPlanSplitSheetProps) {
  const t = useT();
  useOverlayLock(open);

  const [splitEnabled, setSplitEnabled] = useState(defaultSplitEnabled);
  const [splitCount, setSplitCount] = useState(() =>
    clampSplitCount(defaultSplitCount),
  );

  useEffect(() => {
    if (open) {
      setSplitEnabled(defaultSplitEnabled);
      setSplitCount(clampSplitCount(defaultSplitCount));
    }
  }, [defaultSplitCount, defaultSplitEnabled, open]);

  const perPersonPreview = useMemo(() => {
    if (!splitEnabled || totalAmount <= 0) {
      return null;
    }
    return computeTravelPlanPerPerson(totalAmount, splitCount);
  }, [splitCount, splitEnabled, totalAmount]);

  const handleConfirm = useCallback(() => {
    onConfirm({
      splitEnabled,
      splitCount: clampSplitCount(splitCount),
    });
  }, [onConfirm, splitCount, splitEnabled]);

  if (!open) {
    return null;
  }

  return (
    <View
      className="s-overlay s-overlay--sheet s-travel-plan-split-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-travel-plan-split-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="travel-plan-split-sheet-title"
      >
        <View className="s-travel-plan-split-sheet__handle" aria-hidden />

        <View className="s-travel-plan-split-sheet__top">
          <Text
            id="travel-plan-split-sheet-title"
            className="s-travel-plan-split-sheet__title"
          >
            {t('travelPlan.splitSheetTitle')}
          </Text>
          <Button
            className="s-travel-plan-split-sheet__close"
            hoverClass="s-travel-plan-split-sheet__close--pressed"
            aria-label={t('travelPlan.closeAria')}
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <View className="s-travel-plan-split-sheet__body">
          <View
            className={cn(
              's-travel-plan-split-sheet__row',
              !splitEnabled && 's-travel-plan-split-sheet__row--solo',
            )}
          >
            <View className="s-travel-plan-split-sheet__row-copy">
              <Text className="s-travel-plan-split-sheet__row-label">
                {t('travelPlan.splitEnabledLabel')}
              </Text>
              <Text className="s-travel-plan-split-sheet__row-hint">
                {t('travelPlan.splitEnabledHint')}
              </Text>
            </View>
            <ThemeToggle
              checked={splitEnabled}
              onChange={setSplitEnabled}
              ariaLabel={t('travelPlan.splitEnabledLabel')}
            />
          </View>

          {splitEnabled ? (
            <View className="s-travel-plan-split-sheet__row">
              <View className="s-travel-plan-split-sheet__row-copy">
                <Text className="s-travel-plan-split-sheet__row-label">
                  {t('travelPlan.splitCountLabel')}
                </Text>
                <Text className="s-travel-plan-split-sheet__row-hint">
                  {t('travelPlan.splitCountHint')}
                </Text>
              </View>
              <InlineStepper
                value={splitCount}
                min={MIN_SPLIT_COUNT}
                max={MAX_SPLIT_COUNT}
                onChange={setSplitCount}
                ariaDecrease={t('travelPlan.decreaseAria')}
                ariaIncrease={t('travelPlan.increaseAria')}
              />
            </View>
          ) : null}

          {splitEnabled && totalAmount > 0 ? (
            <View className="s-travel-plan-split-sheet__preview">
              <Text className="s-travel-plan-split-sheet__preview-label">
                {t('travelPlan.splitPerPersonPreview', {
                  amount:
                    perPersonPreview != null
                      ? formatTravelPlanCost(perPersonPreview)
                      : '--',
                })}
              </Text>
              <Text className="s-travel-plan-split-sheet__preview-sub">
                {formatTravelPlanCost(totalAmount)} ÷ {splitCount}
              </Text>
            </View>
          ) : null}

          <Text className="s-travel-plan-split-sheet__disclaimer">
            {t('travelPlan.splitDisclaimer')}
          </Text>

          <View className="s-travel-plan-split-sheet__submit-wrap">
            <Button
              className="s-travel-plan-split-sheet__submit"
              hoverClass="s-travel-plan-split-sheet__submit--pressed"
              onClick={handleConfirm}
            >
              <Text className="s-travel-plan-split-sheet__submit-label">
                {t('travelPlan.splitConfirm')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
