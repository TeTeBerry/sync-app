import React, { memo, useCallback, useEffect } from 'react';
import type { CommonEventFunction } from '@tarojs/components';
import { CustomWrapper, Text, View } from '@tarojs/components';
import { formatTimeAgo } from '../../../utils/dayTime';
import type { TempChatSession } from '../../../types/tempChat';
import { NativeSwipeDeleteRow } from '../../components/swipe-delete-row/NativeSwipeDeleteRow';
import type { SwipeRowController } from './swipeDeleteRegistry';
import { useSwipeDeleteRow } from './useSwipeDeleteRow';

const DELETE_ACTION_WIDTH_PX = 80;
const USE_NATIVE_SWIPE = process.env.TARO_ENV === 'weapp';

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
  onOpenRowChange: (rowId: string | null) => void;
  registerRow?: (rowId: string, controller: SwipeRowController) => () => void;
  setOpenRow?: (rowId: string | null) => void;
  onOpen: (sessionId: string) => void;
  onDelete: (session: TempChatSession) => void;
};

type MessageSessionBodyProps = {
  session: TempChatSession;
};

const MessageSessionBody = memo<MessageSessionBodyProps>(({ session }) => {
  const hasUnread = session.unreadCount > 0;
  const badgeLabel = session.unreadCount > 99 ? '99+' : String(session.unreadCount);

  return (
    <>
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
    </>
  );
});

MessageSessionBody.displayName = 'MessageSessionBody';

type ReactSwipeDeleteShellProps = {
  rowId: string;
  hasUnread: boolean;
  registerRow: NonNullable<MessageSessionRowProps['registerRow']>;
  setOpenRow: NonNullable<MessageSessionRowProps['setOpenRow']>;
  onOpen: () => void;
  onDelete: () => void;
  children: React.ReactNode;
};

const ReactSwipeDeleteShell: React.FC<ReactSwipeDeleteShellProps> = ({
  rowId,
  hasUnread,
  registerRow,
  setOpenRow,
  onOpen,
  onDelete,
  children,
}) => {
  const {
    contentId,
    offsetX,
    catchMove,
    isShifted,
    close,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    useDomMotion,
  } = useSwipeDeleteRow({
    rowId,
    setOpenRow,
    actionWidth: DELETE_ACTION_WIDTH_PX,
  });

  useEffect(
    () =>
      registerRow(rowId, {
        close,
        isOpen: isShifted,
      }),
    [close, isShifted, registerRow, rowId],
  );

  const handleOpen = useCallback(() => {
    if (isShifted()) {
      close();
      setOpenRow(null);
      return;
    }
    onOpen();
  }, [close, isShifted, onOpen, setOpenRow]);

  const handleDelete = useCallback(() => {
    close();
    setOpenRow(null);
    onDelete();
  }, [close, onDelete, setOpenRow]);

  const contentStyle = useDomMotion
    ? undefined
    : { transform: `translate3d(${offsetX}px, 0, 0)` };

  return (
    <CustomWrapper>
      <View className="s-messages__swipe-row">
        <View
          className="s-messages__swipe-delete"
          hoverClass="s-messages__swipe-delete--pressed"
          onClick={handleDelete}
        >
          <Text className="s-messages__swipe-delete-label">删除</Text>
        </View>
        <View
          id={contentId}
          className={[
            's-messages__swipe-content',
            hasUnread && 's-messages__swipe-content--unread',
          ]
            .filter(Boolean)
            .join(' ')}
          style={contentStyle}
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
          {children}
        </View>
      </View>
    </CustomWrapper>
  );
};

const MessageSessionRow: React.FC<MessageSessionRowProps> = ({
  session,
  openRowId,
  onOpenRowChange,
  registerRow,
  setOpenRow,
  onOpen,
  onDelete,
}) => {
  const hasUnread = session.unreadCount > 0;

  const handleOpen = useCallback(() => {
    onOpen(session.id);
  }, [onOpen, session.id]);

  const handleDelete = useCallback(() => {
    onDelete(session);
  }, [onDelete, session]);

  const snapOffset = openRowId === session.id ? -DELETE_ACTION_WIDTH_PX : 0;

  const handleSwipeEnd = useCallback(
    (event: { detail: { open: boolean } }) => {
      onOpenRowChange(event.detail.open ? session.id : null);
    },
    [onOpenRowChange, session.id],
  );

  const handleSwipeClose = useCallback(() => {
    onOpenRowChange(null);
  }, [onOpenRowChange]);

  const handleNativeDelete = useCallback(() => {
    onOpenRowChange(null);
    handleDelete();
  }, [handleDelete, onOpenRowChange]);

  if (USE_NATIVE_SWIPE) {
    const badgeLabel = session.unreadCount > 99 ? '99+' : String(session.unreadCount);
    const avatarStyle = session.peerAvatar
      ? `background-image: url(${session.peerAvatar})`
      : '';

    return (
      <NativeSwipeDeleteRow
        snapOffset={snapOffset}
        unread={hasUnread}
        peerName={session.peerName}
        lastMessage={session.lastMessage}
        timeLabel={formatTimeAgo(session.lastMessageAt)}
        badgeLabel={hasUnread ? badgeLabel : ''}
        avatarStyle={avatarStyle}
        onSwipeend={handleSwipeEnd}
        onSwipeclose={handleSwipeClose}
        onOpen={handleOpen}
        onDelete={handleNativeDelete}
      />
    );
  }

  if (!registerRow || !setOpenRow) {
    return null;
  }

  return (
    <ReactSwipeDeleteShell
      rowId={session.id}
      hasUnread={hasUnread}
      registerRow={registerRow}
      setOpenRow={setOpenRow}
      onOpen={handleOpen}
      onDelete={handleDelete}
    >
      <MessageSessionBody session={session} />
    </ReactSwipeDeleteShell>
  );
};

function rowPropsAreEqual(
  prev: MessageSessionRowProps,
  next: MessageSessionRowProps,
): boolean {
  if (prev.session !== next.session) return false;
  if (prev.onOpen !== next.onOpen || prev.onDelete !== next.onDelete) return false;
  if (prev.onOpenRowChange !== next.onOpenRowChange) return false;
  if (prev.registerRow !== next.registerRow || prev.setOpenRow !== next.setOpenRow) {
    return false;
  }

  const wasOpen = prev.openRowId === prev.session.id;
  const isOpen = next.openRowId === next.session.id;
  return wasOpen === isOpen;
}

export default memo(MessageSessionRow, rowPropsAreEqual);
