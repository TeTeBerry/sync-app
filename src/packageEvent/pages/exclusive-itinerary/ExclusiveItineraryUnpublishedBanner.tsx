import { Button } from '../../../components/ui';
import { requireAuth } from '../../../utils/authGate';
import { requestActivityUpdateSubscribe } from '../../../utils/wechatSubscribeMessage';
import { Text, View } from '@tarojs/components';

type ExclusiveItineraryUnpublishedBannerProps = {
  showEmptyLineup?: boolean;
};

export function ExclusiveItineraryUnpublishedBanner({
  showEmptyLineup = false,
}: ExclusiveItineraryUnpublishedBannerProps) {
  const handleSubscribe = () => {
    requireAuth(() => {
      void requestActivityUpdateSubscribe();
    }, 'notification');
  };

  return (
    <View className="s-exclusive-itinerary__unpublished">
      <Text className="s-exclusive-itinerary__unpublished-title">
        {showEmptyLineup ? '阵容尚未官宣' : '时间表尚未发布'}
      </Text>
      <Text className="s-exclusive-itinerary__unpublished-desc">
        阵容尚未官宣，请留意主办方发布。平台不承诺官宣时间。
      </Text>
      <Button
        className="s-exclusive-itinerary__unpublished-btn"
        onClick={handleSubscribe}
      >
        <Text className="s-exclusive-itinerary__unpublished-btn-text">
          订阅活动更新
        </Text>
      </Button>
    </View>
  );
}
