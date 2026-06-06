import './explore.scss';
import { ScrollView, Text, View } from '@tarojs/components';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import { FeedPostList } from '../../../components/post';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { ExploreFeedTabs } from './ExploreFeedTabs';
import { ExplorePageHeader } from './ExplorePageHeader';
import { ExploreShareComposer } from './ExploreShareComposer';
import { useExploreFeedPage } from './useExploreFeedPage';

const ExplorePage = () => {
  useEndRouteTransitionOnShow();
  usePageRouteReady(true);
  const navInsets = useNavBarInsets();
  const {
    activeTab,
    setActiveTab,
    posts,
    isLoading,
    isError,
    refetch,
    handleLike,
    handleDelete,
    handlePublish,
    currentUserAvatar,
    emptyMessage,
    confirmDialog,
    handleScrollToLower,
    showFeedEnd,
    sharerCount,
    isLoadingMore,
  } = useExploreFeedPage();

  return (
    <View data-cmp="ExplorePage" className="s-page-with-tabbar s-explore-page">
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        lowerThreshold={80}
        onScrollToLower={handleScrollToLower}
        className="s-page-with-tabbar__scroll s-explore-page__scroll s-scrollbar-none"
      >
        <View className="s-explore-page__inner">
          <ExplorePageHeader navInsets={navInsets} />
          <ExploreFeedTabs activeTab={activeTab} onChange={setActiveTab} />
          <ExploreShareComposer avatar={currentUserAvatar} onPublish={handlePublish} />

          {isLoading ? (
            <ThemedPageLoader variant="skeleton-feed" minHeight={240} />
          ) : isError ? (
            <View
              className="s-explore-page__empty"
              onClick={() => void refetch()}
              role="button"
              aria-label="加载失败，点击重试"
            >
              <Text className="s-explore-page__empty-text">分享加载失败，点击重试</Text>
            </View>
          ) : posts.length > 0 ? (
            <FeedPostList
              items={posts}
              scrollWindow
              onLike={handleLike}
              onDelete={handleDelete}
              infiniteFooter={{
                isLoadingMore,
                showEnd: showFeedEnd,
                sharerCount,
              }}
            />
          ) : (
            <View className="s-explore-page__empty">
              <Text className="s-explore-page__empty-text">{emptyMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {confirmDialog}
      <BottomNavSlot />
    </View>
  );
};

export default ExplorePage;
