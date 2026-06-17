import React, { useMemo } from 'react';
import { Clock, MessageSquare } from '../../components/icons';
import { PostOwnerDeleteButton } from '../post';
import { stripPostBodyContact } from '../../utils/postBodyContact';
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection';
import type { ProfilePostItem } from '../../types/backend';
import { Text, View } from '@tarojs/components';

const PROFILE_POST_STAT_ICON_SIZE = 14;

export type ProfilePostsSectionProps = {
  items: ProfilePostItem[];
  /** `list` renders all items without collapsible chrome (detail sub-page). */
  mode?: 'collapsible' | 'list';
  onSelect?: (item: ProfilePostItem) => void;
  onDelete?: (item: ProfilePostItem) => void;
};

function ProfilePostItem({
  item,
  onSelect,
  onDelete,
}: {
  item: ProfilePostItem;
  onSelect?: (item: ProfilePostItem) => void;
  onDelete?: (item: ProfilePostItem) => void;
}) {
  const displayBody = useMemo(() => stripPostBodyContact(item.content), [item.content]);

  const stopClickPropagation = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
  };

  return (
    <View
      key={item.id}
      className="s-profile-post s-profile-post--clickable"
      role="button"
      onClick={() => onSelect?.(item)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect?.(item);
      }}
    >
      <View className="s-profile-post__head">
        <Text className="s-profile-post__title">
          <Text className="s-profile-post__title-dot" />
          {item.title}
        </Text>
      </View>

      {displayBody ? (
        <Text className="s-profile-post__content">{displayBody}</Text>
      ) : null}

      <View className="s-profile-post__footer">
        <View className="s-profile-post__stats">
          <View className="s-profile-post__stat">
            <View className="s-profile-post__stat-icon">
              <Clock size={PROFILE_POST_STAT_ICON_SIZE} color="#8e8e93" />
            </View>
            <Text>{item.date}</Text>
          </View>
        </View>
        {onDelete ? (
          <View className="s-profile-post__actions" onClick={stopClickPropagation}>
            <PostOwnerDeleteButton
              className="s-profile-post__action s-profile-post__action--delete"
              onDelete={() => onDelete(item)}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function renderPostItems(
  pageItems: ProfilePostItem[],
  onSelect?: (item: ProfilePostItem) => void,
  onDelete?: (item: ProfilePostItem) => void,
) {
  return pageItems.map((item) => (
    <ProfilePostItem
      key={item.id}
      item={item}
      onSelect={onSelect}
      onDelete={onDelete}
    />
  ));
}

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  items,
  mode = 'collapsible',
  onSelect,
  onDelete,
}) => {
  if (mode === 'list') {
    return (
      <View className="s-profile-section__body s-profile-section__body--standalone">
        {items.length === 0 ? (
          <View className="s-profile-section__empty">
            <View className="s-profile-section__empty-icon s-profile-section__empty-icon--posts">
              <MessageSquare size={22} />
            </View>
            <Text className="s-profile-section__empty-title">还没有帖子</Text>
            <Text className="s-profile-section__empty-hint">
              在活动详情发布模板帖或留言
            </Text>
          </View>
        ) : (
          renderPostItems(items, onSelect, onDelete)
        )}
      </View>
    );
  }

  return (
    <ProfileCollapsibleSection
      variant="posts"
      icon={<MessageSquare size={14} />}
      title="我的帖子"
      items={items}
      renderEmpty={() => (
        <View className="s-profile-section__empty">
          <View className="s-profile-section__empty-icon s-profile-section__empty-icon--posts">
            <MessageSquare size={22} />
          </View>
          <Text className="s-profile-section__empty-title">还没有帖子</Text>
          <Text className="s-profile-section__empty-hint">
            在活动详情发布模板帖或留言
          </Text>
        </View>
      )}
    >
      {(pageItems) => renderPostItems(pageItems, onSelect, onDelete)}
    </ProfileCollapsibleSection>
  );
};

export default ProfilePostsSection;
