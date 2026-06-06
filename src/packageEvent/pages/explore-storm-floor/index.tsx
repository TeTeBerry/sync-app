import './explore-storm-floor.scss';
import { ScrollView, View } from '@tarojs/components';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { StormStageFloorPlan } from './StormStageFloorPlan';

const ExploreStormFloorPage = () => {
  useEndRouteTransitionOnShow();
  usePageRouteReady(true);

  return (
    <View data-cmp="ExploreStormFloorPage" className="s-explore-storm-floor">
      <PageNavigation title="STORM 场内" />
      <ScrollView
        scrollY
        className="s-explore-storm-floor__scroll"
        enhanced
        showScrollbar={false}
      >
        <StormStageFloorPlan />
      </ScrollView>
    </View>
  );
};

export default ExploreStormFloorPage;
