import './TravelPlanReceiptOcrTip.scss';
import Taro from '@tarojs/taro';
import {
  TRAVEL_PLAN_RECEIPT_OCR_CTA,
  TRAVEL_PLAN_RECEIPT_OCR_TIP,
} from '@/constants/aiCtaLabels';
import { goMyItinerary } from '@/utils/route';
import { ChevronRight, ImageIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { Text, View } from '@tarojs/components';

export type TravelPlanReceiptOcrTipProps = {
  activityLegacyId?: number;
  disabled?: boolean;
  className?: string;
};

export function TravelPlanReceiptOcrTip({
  activityLegacyId,
  disabled = false,
  className,
}: TravelPlanReceiptOcrTipProps) {
  const handleClick = () => {
    if (disabled) return;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: '请先绑定活动', icon: 'none' });
      return;
    }
    goMyItinerary(activityLegacyId);
  };

  return (
    <Button
      className={['s-travel-plan-receipt-ocr-tip', className].filter(Boolean).join(' ')}
      disabled={disabled}
      hoverClass="s-travel-plan-receipt-ocr-tip--pressed"
      onClick={handleClick}
    >
      <View className="s-travel-plan-receipt-ocr-tip__icon" aria-hidden>
        <ImageIcon size={18} color="#bf5af2" />
      </View>
      <View className="s-travel-plan-receipt-ocr-tip__copy">
        <Text className="s-travel-plan-receipt-ocr-tip__title">
          {TRAVEL_PLAN_RECEIPT_OCR_TIP}
        </Text>
        <Text className="s-travel-plan-receipt-ocr-tip__cta">
          {TRAVEL_PLAN_RECEIPT_OCR_CTA}
        </Text>
      </View>
      <ChevronRight size={16} color="#bf5af2" aria-hidden />
    </Button>
  );
}
