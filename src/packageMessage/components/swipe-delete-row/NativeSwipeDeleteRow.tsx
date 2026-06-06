import React from 'react';

const DELETE_ACTION_WIDTH_PX = 80;

export type NativeSwipeDeleteRowProps = {
  snapOffset: number;
  unread?: boolean;
  peerName: string;
  lastMessage: string;
  timeLabel: string;
  badgeLabel: string;
  avatarStyle?: string;
  onSwipeend?: (event: { detail: { open: boolean } }) => void;
  onSwipeclose?: () => void;
  onOpen?: () => void;
  onDelete?: () => void;
};

/** Use literal tag name so Taro can collect props for the native component template. */
export function NativeSwipeDeleteRow({
  snapOffset,
  unread = false,
  peerName,
  lastMessage,
  timeLabel,
  badgeLabel,
  avatarStyle,
  onSwipeend,
  onSwipeclose,
  onOpen,
  onDelete,
}: NativeSwipeDeleteRowProps) {
  return (
    <swipe-delete-row
      snapOffset={snapOffset}
      actionWidth={DELETE_ACTION_WIDTH_PX}
      unread={unread}
      peerName={peerName}
      lastMessage={lastMessage}
      timeLabel={timeLabel}
      badgeLabel={badgeLabel}
      avatarStyle={avatarStyle ?? ''}
      onSwipeend={onSwipeend}
      onSwipeclose={onSwipeclose}
      onOpen={onOpen}
      onDelete={onDelete}
    />
  );
}
