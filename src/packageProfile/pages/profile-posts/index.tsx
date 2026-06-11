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
import {
  deletePostAndInvalidate,
  updatePostAndInvalidate,
  useProfilePostsQuery,
} from '../../../hooks/useSyncApi';
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

  const handleCompletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: '标记已组队',
        message: '确认将该帖子标记为已组队？',
        confirmText: '标记已组队',
      });
      if (!ok) return;
      void updatePostAndInvalidate(item.id, { status: 'completed' })
        .then(() => void Taro.showToast({ title: '已更新', icon: 'success' }))
        .catch(() => void Taro.showToast({ title: '更新失败', icon: 'none' }));
    },
    [confirm],
  );

  const handleEditPost = useCallback(
    (item: ProfilePostItem) => {
      if (editingPostId === item.id) {
        setEditingPostId(null);
        setEditDraft(null);
        return;
      }
      setEditingPostId(item.id);
      setEditDraft({
        body: item.content,
        status: item.status === '已组队' ? '已组队' : '招募中',
      });
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
      const status =
        editDraft.status === '已组队' ? 'completed' : ('recruiting' as const);

      if (item.status === '已组队' && status === 'recruiting') {
        const ok = await confirm({
          title: '改回招募中',
          message:
            '若你们已互相组队，双方帖子将恢复招募，组队关系解散，对方会收到通知。确定继续吗？',
          confirmText: '确定',
        });
        if (!ok) return;
      }

      void updatePostAndInvalidate(item.id, { body, status })
        .then(() => {
          handleCancelPostEdit();
          void Taro.showToast({ title: '已保存', icon: 'success' });
        })
        .catch(() => void Taro.showToast({ title: '保存失败', icon: 'none' }));
    },
    [confirm, editDraft, handleCancelPostEdit],
  );

  const handleDeletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: '删除',
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      void deletePostAndInvalidate(item.id)
        .then(() => void Taro.showToast({ title: '已删除', icon: 'success' }))
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: '删除失败', icon: 'none' });
        });
    },
    [confirm, postsQuery],
  );

  return (
    <View data-cmp="ProfilePostsPage" className="s-profile-stack s-page-with-tabbar">
      <View className="s-page-with-tabbar__main">
        <PageNavigation title="我的组队帖" fallback={ROUTES.PROFILE} tone="surface" />

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
                onComplete={handleCompletePost}
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
