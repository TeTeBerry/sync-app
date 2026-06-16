import React from 'react';
import { MessageCircle } from '../icons';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';

export type PostCardActionBarProps = {
  comments: number;
  commentsExpanded: boolean;
  onOpenComments: () => void;
};

const PostCardActionBar: React.FC<PostCardActionBarProps> = ({
  comments,
  commentsExpanded,
  onOpenComments,
}) => {
  const commentClassName = [
    's-event-post__action',
    commentsExpanded && 's-event-post__action--active',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View className="s-event-post__actions">
      <Button
        plain
        hoverClass="none"
        className={commentClassName}
        onClick={(event) => {
          event.stopPropagation?.();
          if (!commentsExpanded) onOpenComments();
        }}
      >
        <MessageCircle size={16} color={commentsExpanded ? '#ff0066' : '#8e8e93'} />
        <Text className="s-event-post__action-label">{comments}</Text>
      </Button>
    </View>
  );
};

export default PostCardActionBar;
