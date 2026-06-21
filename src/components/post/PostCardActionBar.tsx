import React from 'react';
import { MapPin, MessageCircle } from '../icons';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';

export type PostCardActionBarProps = {
  comments: number;
  commentsExpanded: boolean;
  onToggleComments: () => void;
  venueLabel?: string;
};

export const PostCardActionBar: React.FC<PostCardActionBarProps> = ({
  comments,
  commentsExpanded,
  onToggleComments,
  venueLabel,
}) => {
  const commentClassName = [
    's-event-post__action',
    commentsExpanded && 's-event-post__action--active',
  ]
    .filter(Boolean)
    .join(' ');

  const venue = venueLabel?.trim();

  return (
    <View className="s-event-post__actions">
      <Button
        plain
        hoverClass="none"
        className={commentClassName}
        onClick={(event) => {
          event.stopPropagation?.();
          onToggleComments();
        }}
      >
        <MessageCircle size={16} color={commentsExpanded ? '#ff0066' : '#8e8e93'} />
        <Text className="s-event-post__action-label">{comments}</Text>
      </Button>
      {venue ? (
        <View className="s-event-post__venue" aria-label={venue}>
          <MapPin size={14} color="#8e8e93" aria-hidden />
          <Text className="s-event-post__venue-text">{venue}</Text>
        </View>
      ) : null}
    </View>
  );
};
