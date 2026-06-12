import '../../../components/profile/profile.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useState } from 'react';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import PageNavigation, {
  stackPageNavChromePx,
} from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import {
  ProfilePostsSection,
  type ProfilePostEditDraft,
} from '../../../components/profile';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useOverlayLock } from '../../../hooks/useOverlayLock';
import {
  updatePostAndInvalidate,
  useProfilePostsQuery,
} from '../../../hooks/useSyncApi';
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
  const [postsOverride, setPostsOverride] = useState<ProfilePostItem[] | null>(null);
  const posts = postsOverride ?? postsQuery.data ?? [];
  const loading = postsQuery.isLoading && !postsQuery.data;
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProfilePostEditDraft | null>(null);

  useOverlayLock(editingPostId != null);

  useDidShow(() => {
    invalidateProfilePosts();
  });

  useEffect(() => {
    setPostsOverride(null);
  }, [postsQuery.data]);

  const handleSelectPost = useCallback((item: ProfilePostItem) => {
    const activityLegacyId = item.activityLegacyId;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: '无法打开该帖子所属活动', icon: 'none' });
      return;
    }
    goEventDetail(activityLegacyId, { postId: item.id });
  }, []);

  const handleEditPost = useCallback(
    (item: ProfilePostItem) => {
      if (editingPostId === item.id) {
        setEditingPostId(null);
        setEditDraft(null);
        return;
      }
      setEditingPostId(item.id);
      setEditDraft({ body: item.content });
    },
    [editingPostId],
  );

  const handleCancelPostEdit = useCallback(() => {
    setEditingPostId(null);
    setEditDraft(null);
  }, []);

  const handleSavePostEdit = useCallback(
    async (item: ProfilePostItem) => {
      if (!editDraft) return;
      const body = editDraft.body.trim();
      if (!body) {
        void Taro.showToast({ title: '帖子内容不能为空', icon: 'none' });
        return;
      }

      void updatePostAndInvalidate(item.id, { body })
        .then(() => {
          handleCancelPostEdit();
          void Taro.showToast({ title: '已保存', icon: 'success' });
        })
        .catch(() => void Taro.showToast({ title: '保存失败', icon: 'none' }));
    },
    [editDraft, handleCancelPostEdit],
  );

  const handleDeletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: '删除',
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      void deletePostWithFeedback(item.id, {
        refetchOnFailure: () => postsQuery.refetch(),
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
                mode="list"
                items={posts}
                editingPostId={editingPostId}
                editDraft={editDraft}
                onSelect={handleSelectPost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onEditDraftChange={setEditDraft}
                onSaveEdit={handleSavePostEdit}
                onCancelEdit={handleCancelPostEdit}
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
