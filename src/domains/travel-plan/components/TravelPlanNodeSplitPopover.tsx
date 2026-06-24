import { Minus, Plus } from '@/components/icons';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';
import { useEffect, useState } from 'react';
import {
  clampSplitCount,
  computeTravelPlanPerPerson,
  MAX_SPLIT_COUNT,
  MIN_SPLIT_COUNT,
} from '../utils/travelPlanSplit.util';
import { formatTravelPlanCost } from '../utils/travelPlanStats';

export type TravelPlanNodeSplitPopoverProps = {
  open: boolean;
  splitEnabled: boolean;
  splitCount: number;
  price?: number;
  onClose: () => void;
  onConfirm: (input: { splitEnabled: boolean; splitCount: number }) => void;
};

export function TravelPlanNodeSplitPopover({
  open,
  splitEnabled,
  splitCount,
  price,
  onClose,
  onConfirm,
}: TravelPlanNodeSplitPopoverProps) {
  const t = useT();
  const [count, setCount] = useState(() => clampSplitCount(splitCount));

  useEffect(() => {
    if (open) {
      setCount(clampSplitCount(splitCount));
    }
  }, [open, splitCount]);

  if (!open) {
    return null;
  }

  const perPerson =
    price != null && price > 0 ? computeTravelPlanPerPerson(price, count) : null;

  return (
    <>
      <View
        className="s-travel-plan__node-split-backdrop"
        onClick={onClose}
        catchMove
      />
      <View
        className="s-travel-plan__node-split-popover"
        catchMove
        onClick={(event) => event.stopPropagation()}
      >
        <Text className="s-travel-plan__node-split-popover-title">
          {t('travelPlan.splitNodePopoverTitle')}
        </Text>
        <View className="s-travel-plan__node-split-popover-stepper">
          <Button
            className="s-travel-plan__node-split-popover-stepper-btn"
            disabled={count <= MIN_SPLIT_COUNT}
            hoverClass="s-travel-plan__node-split-popover-stepper-btn--pressed"
            aria-label={t('travelPlan.decreaseAria')}
            onClick={() => setCount((value) => Math.max(MIN_SPLIT_COUNT, value - 1))}
          >
            <Minus size={14} color="rgba(255,255,255,0.9)" aria-hidden />
          </Button>
          <Text className="s-travel-plan__node-split-popover-stepper-value">
            {count} {t('travelPlan.headcountUnit')}
          </Text>
          <Button
            className="s-travel-plan__node-split-popover-stepper-btn"
            disabled={count >= MAX_SPLIT_COUNT}
            hoverClass="s-travel-plan__node-split-popover-stepper-btn--pressed"
            aria-label={t('travelPlan.increaseAria')}
            onClick={() => setCount((value) => Math.min(MAX_SPLIT_COUNT, value + 1))}
          >
            <Plus size={14} color="rgba(255,255,255,0.9)" aria-hidden />
          </Button>
        </View>
        {perPerson != null ? (
          <Text className="s-travel-plan__node-split-popover-preview">
            {t('travelPlan.splitPerPersonPreview', {
              amount: formatTravelPlanCost(perPerson),
            })}
          </Text>
        ) : null}
        <Button
          className="s-travel-plan__node-split-popover-confirm"
          hoverClass="s-travel-plan__node-split-popover-confirm--pressed"
          onClick={() => {
            onConfirm({ splitEnabled: true, splitCount: count });
            onClose();
          }}
        >
          <Text className="s-travel-plan__node-split-popover-confirm-label">
            {t('travelPlan.splitNodeConfirm')}
          </Text>
        </Button>
        {splitEnabled ? (
          <Button
            className="s-travel-plan__node-split-popover-disable"
            hoverClass="s-travel-plan__node-split-popover-disable--pressed"
            onClick={() => {
              onConfirm({ splitEnabled: false, splitCount: count });
              onClose();
            }}
          >
            <Text className="s-travel-plan__node-split-popover-disable-label">
              {t('travelPlan.splitNodeDisable')}
            </Text>
          </Button>
        ) : null}
      </View>
    </>
  );
}
