declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'swipe-delete-row': {
        snapOffset?: number;
        actionWidth?: number;
        unread?: boolean;
        peerName?: string;
        lastMessage?: string;
        timeLabel?: string;
        badgeLabel?: string;
        avatarStyle?: string;
        onSwipeend?: (event: { detail: { open: boolean } }) => void;
        onSwipeclose?: () => void;
        onOpen?: () => void;
        onDelete?: () => void;
      };
    }
  }
}
