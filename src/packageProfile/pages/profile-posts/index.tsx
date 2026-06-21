import '../../../components/profile/profile.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback } from 'react';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import PageNavigation, {
  stackPageNavChromePx,
} from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { ProfilePostsSection } from '../../../components/profile';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useProfilePostsQuery } from '../../../hooks/useSyncApi';
import { deletePostWithFeedback } from '../../../utils/deletePostFeedback';
import { invalidateProfilePosts } from '../../../utils/queryInvalidation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import type { ProfilePostItem } from '../../../types/backend';
import { goEventDetail, ROUTES } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { ScrollView, View } from '@tarojs/components';

const ProfilePostsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const navInsets = useNavBarInsets();
  const headerChromePx = stackPageNavChromePx(navInsets);
  const mainScrollHeight = useTabPageMainHeight(headerChromePx);
  const postsQuery = useProfilePostsQuery();
  const posts = postsQuery.data ?? [];
  const loading = postsQuery.isLoading && !postsQuery.data;
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });

  useDidShow(() => {
    invalidateProfilePosts();
  });

  const handleSelectPost = useCallback((item: ProfilePostItem) => {
    const activityLegacyId = item.activityLegacyId;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: '无法打开该帖子所属活动', icon: 'none' });
      return;
    }
    goEventDetail(activityLegacyId, { postId: item.id });
  }, []);

  const handleDeletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: '删除',
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      deletePostWithFeedback(item.id, {
        refetchOnFailure: async () => {
          await postsQuery.refetch();
        },
      });
    },
    [confirm, postsQuery],
  );

  return (
    <View data-cmp="ProfilePostsPage" className="s-profile-stack s-page-with-tabbar">
      <View className="s-page-with-tabbar__main">
        <PageNavigation title="我的帖子" fallback={ROUTES.PROFILE} tone="surface" />

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-profile-stack__scroll s-scrollbar-none"
          style={
            mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
          }
        >
          <View className="s-profile-stack__inner">
            {loading ? (
              <ThemedPageLoader variant="inline" label="加载帖子…" minHeight={120} />
            ) : (
              <ProfilePostsSection
                items={posts}
                mode="list"
                onSelect={handleSelectPost}
                onDelete={handleDeletePost}
              />
            )}
          </View>
        </ScrollView>
      </View>
      {confirmDialog}
      <PageTabBarChrome />
    </View>
  );
};

export default ProfilePostsPage;
