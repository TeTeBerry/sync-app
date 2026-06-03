import './ChatBuddyCard.scss';
import { MapPin } from '../icons';
import type { TeamApplyBuddyPreview } from '../../utils/teamApplyBuddyPreview';
import { Text, View } from '@tarojs/components';

export type ChatBuddyCardProps = {
  peerName: string;
  peerAvatar?: string;
  postTitle?: string;
  buddyInfo: TeamApplyBuddyPreview;
};

export function ChatBuddyCard({
  peerName,
  peerAvatar,
  postTitle,
  buddyInfo,
}: ChatBuddyCardProps) {
  return (
    <View className="s-chat-buddy-card" aria-label={`${peerName} 的组队信息`}>
      <View className="s-chat-buddy-card__head">
        <View
          className="s-chat-buddy-card__avatar"
          style={peerAvatar ? { backgroundImage: `url(${peerAvatar})` } : undefined}
          aria-hidden
        />
        <View className="s-chat-buddy-card__head-text">
          <Text className="s-chat-buddy-card__name">{peerName}</Text>
          {postTitle ? (
            <Text className="s-chat-buddy-card__event">{postTitle}</Text>
          ) : null}
        </View>
      </View>
      <Text className="s-chat-buddy-card__label">Ta 的组队信息</Text>
      <Text className="s-chat-buddy-card__body">{buddyInfo.body}</Text>
      {buddyInfo.location ? (
        <View className="s-chat-buddy-card__meta">
          <MapPin size={12} color="#8e8e93" aria-hidden />
          <Text className="s-chat-buddy-card__meta-text">{buddyInfo.location}</Text>
        </View>
      ) : null}
      {buddyInfo.tags.length ? (
        <View className="s-chat-buddy-card__tags">
          {buddyInfo.tags.map((tag) => (
            <Text key={tag} className="s-chat-buddy-card__tag">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
