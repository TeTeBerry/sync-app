import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { Ban } from '../../../../components/icons';
import ThemedPageLoader from '../../../../components/ThemedPageLoader';
import { ImageWithFallback } from '../../../../components/ImageWithFallback';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import {
  unblockUserAndInvalidate,
  useBlockedUsersQuery,
} from '../../../../hooks/useSyncApi';
import { PLACEHOLDER_AVATAR } from '../../../../constants/remoteImages';
import { getApiErrorMessage } from '../../../../utils/apiErrorMessage';
import { sanitizeRemoteImageUrl } from '../../../../utils/imageUrl';
import type { BlockedUserItem } from '../../../../types/backend';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';

function BlockedUserRow({
  item,
  unblocking,
  onUnblock,
}: {
  item: BlockedUserItem;
  unblocking: boolean;
  onUnblock: (userId: string) => void;
}) {
  const avatar = sanitizeRemoteImageUrl(item.avatar) || PLACEHOLDER_AVATAR;

  return (
    <View className="s-settings-blocked__row">
      <ImageWithFallback
        src={avatar}
        alt={item.name}
        imageClassName="s-settings-blocked__avatar"
        placeholderClassName="s-settings-blocked__avatar s-settings-blocked__avatar--placeholder"
        fallback={item.name.slice(0, 1)}
      />
      <View className="s-settings-blocked__meta">
        <Text className="s-settings-blocked__name">{item.name}</Text>
        <Text className="s-settings-blocked__hint">已屏蔽其帖子与匹配</Text>
      </View>
      <Button
        className="s-settings-blocked__unblock"
        hoverClass="s-settings-blocked__unblock--pressed"
        disabled={unblocking}
        onClick={() => onUnblock(item.userId)}
      >
        <Text className="s-settings-blocked__unblock-text">
          {unblocking ? '处理中…' : '取消屏蔽'}
        </Text>
      </Button>
    </View>
  );
}

export function BlockedUsersSettings() {
  const { data, isLoading, isError, refetch } = useBlockedUsersQuery();
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });
  const [pendingId, setPendingId] = useState<string | null>(null);

  const items = data?.items ?? [];

  useDidShow(() => {
    void refetch();
  });

  const handleUnblock = useCallback(
    async (userId: string, displayName: string) => {
      const ok = await confirm({
        title: '取消屏蔽',
        message: `取消屏蔽后，你将再次看到「${displayName}」发布的内容。`,
        confirmText: '取消屏蔽',
      });
      if (!ok) return;

      setPendingId(userId);
      try {
        await unblockUserAndInvalidate(userId);
        await refetch();
        void Taro.showToast({ title: '已取消屏蔽', icon: 'success' });
      } catch (error) {
        void Taro.showToast({
          title: getApiErrorMessage(error, '操作失败，请稍后重试'),
          icon: 'none',
        });
      } finally {
        setPendingId(null);
      }
    },
    [confirm, refetch],
  );

  if (isLoading) {
    return <ThemedPageLoader variant="inline" minHeight={160} />;
  }

  if (isError) {
    return (
      <View className="s-settings-blocked__empty">
        <Text className="s-settings-blocked__empty-text">加载失败</Text>
        <Button className="s-settings-blocked__retry" onClick={() => void refetch()}>
          <Text className="s-btn-label">重试</Text>
        </Button>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="s-settings-blocked__empty">
        <View className="s-settings-blocked__empty-icon" aria-hidden>
          <Ban size={28} color="#8e8e93" />
        </View>
        <Text className="s-settings-blocked__empty-title">暂无屏蔽用户</Text>
        <Text className="s-settings-blocked__empty-text">
          在帖子菜单中选择「屏蔽该用户」后，会显示在这里
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="s-settings-blocked">
        <Text className="s-settings-blocked__intro">
          以下用户的帖子不会出现在你的动态与匹配结果中
        </Text>
        <View className="s-settings__card s-settings-blocked__card">
          {items.map((item) => (
            <BlockedUserRow
              key={item.userId}
              item={item}
              unblocking={pendingId === item.userId}
              onUnblock={(userId) => void handleUnblock(userId, item.name)}
            />
          ))}
        </View>
      </View>
      {confirmDialog}
    </>
  );
}
