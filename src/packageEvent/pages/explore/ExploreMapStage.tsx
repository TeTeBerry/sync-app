import { CoverView, Map, Text, View } from '@tarojs/components';
import { useExploreMap } from './useExploreMap';

const ExploreMapStage = () => {
  const { mapProps, venueTitle, venueSubtitle, mapReady } = useExploreMap();

  return (
    <View data-cmp="ExploreMapStage" className="s-explore-map">
      <Map {...mapProps} />
      <CoverView className="s-explore-map__hud">
        <CoverView className="s-explore-map__hud-title">{venueTitle}</CoverView>
        <CoverView className="s-explore-map__hud-sub">{venueSubtitle}</CoverView>
        <CoverView className="s-explore-map__chips">
          <CoverView className="s-explore-map__chip">
            <CoverView className="s-explore-map__chip-dot s-explore-map__chip-dot--onsite" />
            <CoverView className="s-explore-map__chip-text">在场</CoverView>
          </CoverView>
          <CoverView className="s-explore-map__chip">
            <CoverView className="s-explore-map__chip-dot s-explore-map__chip-dot--want" />
            <CoverView className="s-explore-map__chip-text">想去</CoverView>
          </CoverView>
          <CoverView className="s-explore-map__chip">
            <CoverView className="s-explore-map__chip-dot s-explore-map__chip-dot--pulse" />
            <CoverView className="s-explore-map__chip-text">Pulse</CoverView>
          </CoverView>
        </CoverView>
        {!mapReady ? (
          <CoverView className="s-explore-map__loading">
            <Text>地图加载中…</Text>
          </CoverView>
        ) : null}
      </CoverView>
    </View>
  );
};

export default ExploreMapStage;
