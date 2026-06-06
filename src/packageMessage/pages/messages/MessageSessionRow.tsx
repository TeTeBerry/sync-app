import React, { useCallback } from 'react';
import type { CommonEventFunction } from '@tarojs/components';
import { Text, View } from '@tarojs/components';
import { Button } from '../../../components/ui';
import { formatTimeAgo } from '../../../utils/dayTime';
import type { TempChatSession } from '../../../types/tempChat';
import { useSwipeDeleteRow } from './useSwipeDeleteRow';

const DELETE_ACTION_WIDTH_PX = 80;

function readTouchPoint(
  event: Parameters<CommonEventFunction>[0],
): { x: number; y: number } | null {
  const touch = (
    event as {
      touches?: Array<{
        clientX?: number;
        clientY?: number;
        pageX?: number;
        pageY?: number;
      }>;
    }
  ).touches?.[0];
  if (!touch) return null;
  return {
    x: touch.clientX ?? touch.pageX ?? 0,
    y: touch.clientY ?? touch.pageY ?? 0,
  };
}

export type MessageSessionRowProps = {
  session: TempChatSession;
  openRowId: string | null;
  setOpenRowId: (id: string | null) => void;
  onOpen: (sessionId: string) => void;
  onDelete: (session: TempChatSession) => void;
};

const MessageSessionRow: React.FC<MessageSessionRowProps> = ({
  session,
  openRowId,
  setOpenRowId,
  onOpen,
  onDelete,
}) => {
  const hasUnread = session.unreadCount > 0;
  const badgeLabel = session.unreadCount > 99 ? '99+' : String(session.unreadCount);

  const {
    offsetX,
    catchMove,
    dragging,
    isOpen,
    close,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useSwipeDeleteRow({
    rowId: session.id,
    openRowId,
    setOpenRowId,
    actionWidth: DELETE_ACTION_WIDTH_PX,
  });

  const handleOpen = useCallback(() => {
    if (isOpen || offsetX < 0) {
      close();
      return;
    }
    onOpen(session.id);
  }, [close, isOpen, offsetX, onOpen, session.id]);

  const handleDelete = useCallback(() => {
    close();
    onDelete(session);
  }, [close, onDelete, session]);

  return (
    <View className="s-messages__swipe-row">
      <Button
        className="s-messages__swipe-delete"
        hoverClass="s-messages__swipe-delete--pressed"
        onClick={handleDelete}
      >
        <Text className="s-messages__swipe-delete-label">删除</Text>
      </Button>
      <View
        className={[
          's-messages__swipe-content',
          dragging && 's-messages__swipe-content--dragging',
          hasUnread && 's-messages__swipe-content--unread',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ transform: `translateX(${offsetX}px)` }}
        catchMove={catchMove}
        onTouchStart={(event) => {
          const point = readTouchPoint(event);
          if (!point) return;
          onTouchStart(point.x, point.y);
        }}
        onTouchMove={(event) => {
          const point = readTouchPoint(event);
          if (!point) return;
          onTouchMove(point.x, point.y);
        }}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onClick={handleOpen}
      >
        <View className="s-messages__avatar-wrap" aria-hidden>
          <View
            className="s-messages__avatar"
            style={
              session.peerAvatar
                ? { backgroundImage: `url(${session.peerAvatar})` }
                : undefined
            }
          />
          {hasUnread ? <View className="s-messages__avatar-dot" /> : null}
        </View>
        <View className="s-messages__body">
          <View className="s-messages__row">
            <Text className="s-messages__name">{session.peerName}</Text>
            <Text className="s-messages__time">
              {formatTimeAgo(session.lastMessageAt)}
            </Text>
          </View>
          <View className="s-messages__preview-row">
            <Text className="s-messages__preview">{session.lastMessage}</Text>
            {hasUnread ? <Text className="s-messages__badge">{badgeLabel}</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export default MessageSessionRow;
