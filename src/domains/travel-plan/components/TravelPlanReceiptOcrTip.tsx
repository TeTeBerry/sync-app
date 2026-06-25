import './TravelPlanReceiptOcrTip.scss';
import {
  getTravelPlanReceiptOcrCta,
  getTravelPlanReceiptOcrTip,
} from '@/constants/aiCtaLabels';
import { goMyItinerary } from '@/utils/route';
import { ChevronRight, ImageIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { Text, View } from '@tarojs/components';
import { showAppToast } from '@/utils/appToast';

export type TravelPlanReceiptOcrTipProps = {
  activityLegacyId?: number;
  headcount?: number;
  disabled?: boolean;
  className?: string;
};

export function TravelPlanReceiptOcrTip({
  activityLegacyId,
  headcount,
  disabled = false,
  className,
}: TravelPlanReceiptOcrTipProps) {
  const handleClick = () => {
    if (disabled) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      showAppToast('common.pleaseSelectEvent', { icon: 'none' });
      return;
    }
    goMyItinerary(activityLegacyId, undefined, {
      headcount: headcount != null && headcount > 0 ? headcount : undefined,
    });
  };

  return (
    <View
      className={['s-travel-plan-receipt-ocr-tip-wrap', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Button
        className="s-travel-plan-receipt-ocr-tip"
        disabled={disabled}
        hoverClass="s-travel-plan-receipt-ocr-tip--pressed"
        onClick={handleClick}
      >
        <View className="s-travel-plan-receipt-ocr-tip__icon" aria-hidden>
          <ImageIcon size={18} color="#bf5af2" />
        </View>
        <View className="s-travel-plan-receipt-ocr-tip__copy">
          <Text className="s-travel-plan-receipt-ocr-tip__title">
            {getTravelPlanReceiptOcrTip()}
          </Text>
          <Text className="s-travel-plan-receipt-ocr-tip__cta">
            {getTravelPlanReceiptOcrCta()}
          </Text>
        </View>
        <ChevronRight size={16} color="#bf5af2" aria-hidden />
      </Button>
    </View>
  );
}
