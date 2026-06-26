import { X } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import './TravelGuidePeaceBanner.scss';

type TravelGuidePeaceBannerProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function TravelGuidePeaceBanner({
  visible,
  onDismiss,
}: TravelGuidePeaceBannerProps) {
  const t = useT();

  if (!visible) {
    return null;
  }

  return (
    <View className="s-travel-guide-peace-banner" data-cmp="TravelGuidePeaceBanner">
      <Text className="s-travel-guide-peace-banner__message">
        {t('plur.peaceBanner.message')}
      </Text>
      <Button
        className="s-travel-guide-peace-banner__close"
        hoverClass="s-travel-guide-peace-banner__close--pressed"
        aria-label={t('plur.peaceBanner.close')}
        onClick={onDismiss}
      >
        <X size={14} color="#8e8e93" aria-hidden />
      </Button>
    </View>
  );
}
