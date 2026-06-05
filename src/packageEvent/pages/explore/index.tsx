import './explore.scss';
import { View } from '@tarojs/components';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import TabPageHeader from '../../../components/navigation/TabPageHeader';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import ExploreMapStage from './ExploreMapStage';

const ExplorePage = () => {
  useEndRouteTransitionOnShow();
  usePageRouteReady(true);
  const navInsets = useNavBarInsets();

  return (
    <View data-cmp="ExplorePage" className="s-page-with-tabbar s-explore-page">
      <View className="s-page-with-tabbar__main s-explore-page__main">
        <TabPageHeader navInsets={navInsets} title="探索" />
        <ExploreMapStage />
      </View>
      <BottomNavSlot />
    </View>
  );
};

export default ExplorePage;
