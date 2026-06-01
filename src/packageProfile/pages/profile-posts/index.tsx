import '../../../components/profile/profile.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback, useState } from 'react';
import PageNavigation from '../../../components/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import {
  ProfilePostsSection,
  profilePosts,
  type ProfilePostEditDraft,
} from '../../../components/profile';
import { isApiEnabled } from '../../../constants/api';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import {
  deletePostAndInvalidate,
  updatePostAndInvalidate,
  useProfilePostsQuery,
} from '../../../hooks/useSyncApi';
import { invalidateProfilePosts } from '../../../utils/queryInvalidation';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import type { ProfilePostItem } from '../../../types/backend';
import { goEventDetail, ROUTES } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { ScrollView, View } from '@tarojs/components';

const ProfilePostsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const mainScrollHeight = useStackPageMainHeight();
  const apiEnabled = isApiEnabled();
  const postsQuery = useProfilePostsQuery();
  const posts = apiEnabled && postsQuery.data ? postsQuery.data : profilePosts;
  const loading = apiEnabled && postsQuery.isLoading && !postsQuery.data;
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProfilePostEditDraft | null>(null);

  useDidShow(() => {
    if (apiEnabled) {
      invalidateProfilePosts();
    }
  });

  const handlePostAction = useCallback((action: string, item: ProfilePostItem) => {
    void Taro.showToast({ title: `${action}: ${item.title}`, icon: 'none' });
  }, []);

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
      if (!apiEnabled) {
        handlePostAction('标记已组队', item);
        return;
      }
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
    [apiEnabled, confirm, handlePostAction],
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
    (item: ProfilePostItem) => {
      if (!editDraft) return;
      const body = editDraft.body.trim();
      if (!body) {
        void Taro.showToast({ title: '帖子内容不能为空', icon: 'none' });
        return;
      }
      if (!apiEnabled) {
        handlePostAction('保存修改', item);
        handleCancelPostEdit();
        return;
      }
      const status =
        editDraft.status === '已组队' ? 'completed' : ('recruiting' as const);
      void updatePostAndInvalidate(item.id, { body, status })
        .then(() => {
          handleCancelPostEdit();
          void Taro.showToast({ title: '已保存', icon: 'success' });
        })
        .catch(() => void Taro.showToast({ title: '保存失败', icon: 'none' }));
    },
    [apiEnabled, editDraft, handleCancelPostEdit, handlePostAction],
  );

  const handleDeletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: '删除',
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      if (!apiEnabled) {
        handlePostAction('删除', item);
        return;
      }
      void deletePostAndInvalidate(item.id)
        .then(() => void Taro.showToast({ title: '已删除', icon: 'success' }))
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: '删除失败', icon: 'none' });
        });
    },
    [apiEnabled, confirm, handlePostAction, postsQuery],
  );

  return (
    <View data-cmp="ProfilePostsPage" className="s-profile-stack">
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

      {confirmDialog}
    </View>
  );
};

export default ProfilePostsPage;
