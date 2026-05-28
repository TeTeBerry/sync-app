import React from "react";
import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";
import { View } from '@tarojs/components';

const Explore: React.FC = () => {
  return (
    <View className="s-page-shell">
      <TopBar />
      <View className="s-page-shell__muted-center">探索页面开发中...</View>
      <BottomNav />
    </View>
  );
};

export default Explore;
