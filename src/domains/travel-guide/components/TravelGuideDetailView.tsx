import type { TravelGuidePlan } from '@/types/travelGuide';
import { View } from '@tarojs/components';
import './TravelGuideDetailView.scss';
import { TravelGuideDetailHero } from './TravelGuideDetailHero';
import { TravelGuideDetailBody } from './TravelGuideDetailBody';

type TravelGuideDetailViewProps = {
  plan: TravelGuidePlan;
};

export function TravelGuideDetailView({ plan }: TravelGuideDetailViewProps) {
  return (
    <View className="s-travel-guide-detail">
      <TravelGuideDetailHero plan={plan} />
      <TravelGuideDetailBody plan={plan} />
    </View>
  );
}
