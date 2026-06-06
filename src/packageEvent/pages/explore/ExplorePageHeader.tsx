import './ExplorePageHeader.scss';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import type { NavBarInsets } from '../../../hooks/useNavBarInsets';
import { tabPageHeaderStyle } from '../../../components/navigation/TabPageHeader';

const HEADER_CHIPS = ['#电音', '#现场'];

type ExplorePageHeaderProps = {
  navInsets?: NavBarInsets;
};

export const ExplorePageHeader: FC<ExplorePageHeaderProps> = ({ navInsets }) => {
  const insetStyle =
    navInsets != null
      ? tabPageHeaderStyle(navInsets, { paddingRightGutterPx: 0 })
      : undefined;

  return (
    <View className="s-explore-header" style={insetStyle}>
      <Text className="s-explore-header__title">探索</Text>
      <View className="s-explore-header__chips">
        {HEADER_CHIPS.map((chip) => (
          <View key={chip} className="s-explore-header__chip">
            <Text className="s-explore-header__chip-text">{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
