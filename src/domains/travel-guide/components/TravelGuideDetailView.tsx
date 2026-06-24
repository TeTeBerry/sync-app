import type { ActivityMapRegion } from '@/constants/activityMapRegion';
import type { TravelGuidePlan } from '@/types/travelGuide';
import { View } from '@tarojs/components';
import './TravelGuideDetailView.scss';
import { TravelGuideDetailHero } from './TravelGuideDetailHero';
import { TravelGuideDetailBody } from './TravelGuideDetailBody';

type TravelGuideDetailViewProps = {
  plan: TravelGuidePlan;
  activityRegion?: ActivityMapRegion | null;
};

export function TravelGuideDetailView({
  plan,
  activityRegion,
}: TravelGuideDetailViewProps) {
  return (
    <View className="s-travel-guide-detail">
      <TravelGuideDetailHero plan={plan} activityRegion={activityRegion} />
      <TravelGuideDetailBody plan={plan} />
    </View>
  );
}
