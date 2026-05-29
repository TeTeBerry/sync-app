import "./EventMapUserPostsSheet.scss";
import { memo } from "react";
import { Heart, MapPin, MessageCircle, X } from "lucide-react-taro";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";
import { useOverlayLock } from "../../hooks/useOverlayLock";
import { useNavigationStore } from "../../stores";
import {
  ContentTypeBadge,
  stripContentTypeHashtags,
} from "../ContentTypeBadge";
import { PostImageGrid } from "../PostImageGrid";
import type { EventMapMarker } from "./eventMapMarkers";
import { markerAvatarUrl } from "./eventMapMarkers";
import type { EventMapUserPost } from "./eventMapUserPostsData";
import { useEventMapUserSheet } from "./useEventMapUserSheet";

export type EventMapUserPostsSheetProps = {
  open: boolean;
  marker: EventMapMarker | null;
  activityLegacyId?: number;
  onClose: () => void;
};

function ringStyle(ring: string): string {
  return `0 0 0 3px ${ring}`;
}

const EventMapUserPostCard = memo(function EventMapUserPostCard({
  post,
}: {
  post: EventMapUserPost;
}) {
  const body = stripContentTypeHashtags(post.body);

  return (
    <View className="s-event-map-user-sheet__post">
      <View className="s-event-map-user-sheet__post-head">
        <ContentTypeBadge types={post.contentTypes} />
        <View className="s-event-map-user-sheet__post-meta">
          <MapPin size={11} color="rgba(255,255,255,0.38)" />
          <Text>{post.location}</Text>
          <Text className="s-event-map-user-sheet__post-meta-dot">·</Text>
          <Text>{post.timeLabel}</Text>
        </View>
      </View>
      {body ? (
        <Text className="s-event-map-user-sheet__post-body">{body}</Text>
      ) : null}
      {post.images?.length ? (
        <PostImageGrid images={post.images} maxDisplay={3} />
      ) : null}
      <View className="s-event-map-user-sheet__post-foot">
        <View className="s-event-map-user-sheet__stat">
          <Heart size={14} color="rgba(255,255,255,0.5)" />
          <Text>{post.likes}</Text>
        </View>
        <View className="s-event-map-user-sheet__stat">
          <MessageCircle size={14} color="rgba(255,255,255,0.5)" />
          <Text>{post.comments}</Text>
        </View>
      </View>
    </View>
  );
});

export function EventMapUserPostsSheet({
  open,
  marker,
  activityLegacyId: activityLegacyIdProp,
  onClose,
}: EventMapUserPostsSheetProps) {
  useOverlayLock(open);

  const activeActivityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId,
  );
  const { sheet, isLoading, isError } = useEventMapUserSheet(
    marker,
    open,
    activityLegacyIdProp,
    activeActivityLegacyId,
  );

  if (!marker || !sheet) {
    return null;
  }

  const avatarSrc =
    sheet.avatarUrl ?? markerAvatarUrl(marker.avatarSeed, 120);

  return (
    <View
      className={`s-overlay s-overlay--sheet s-event-map-user-sheet${open ? "" : " s-overlay--off"}`}
      role="presentation">
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View className="s-overlay__panel s-event-map-user-sheet__panel" aria-hidden={!open}>
        <View className="s-event-map-user-sheet__handle" aria-hidden />

        <View className="s-event-map-user-sheet__header">
          <View className="s-event-map-user-sheet__profile">
            <View
              className="s-event-map-user-sheet__avatar-wrap"
              style={{ boxShadow: ringStyle(marker.ring) }}>
              <Image
                className="s-event-map-user-sheet__avatar"
                src={avatarSrc}
                mode="aspectFill"
              />
            </View>
            <View className="s-event-map-user-sheet__profile-main">
              <Text className="s-event-map-user-sheet__name">
                {sheet.displayName}
                {sheet.emoji ? ` ${sheet.emoji}` : ""}
              </Text>
              <View className="s-event-map-user-sheet__status">
                <MapPin size={12} color="rgba(255,255,255,0.42)" />
                <Text>{sheet.statusText}</Text>
              </View>
            </View>
          </View>
          <Button
            className="s-event-map-user-sheet__close"
            aria-label="关闭"
            onClick={onClose}>
            <X size={18} color="#fff" />
          </Button>
        </View>

        <View className="s-event-map-user-sheet__posts-head">
          <Text className="s-event-map-user-sheet__posts-title">TA 的帖子</Text>
          <Text className="s-event-map-user-sheet__posts-count">
            {sheet.posts.length} 条
          </Text>
        </View>

        <ScrollView scrollY className="s-event-map-user-sheet__scroll" showScrollbar={false}>
          {isLoading ? (
            <View className="s-event-map-user-sheet__empty">
              <Text>加载中…</Text>
            </View>
          ) : isError ? (
            <View className="s-event-map-user-sheet__empty">
              <Text>加载失败，请稍后重试</Text>
            </View>
          ) : sheet.posts.length ? (
            sheet.posts.map((post) => (
              <EventMapUserPostCard key={post.id} post={post} />
            ))
          ) : (
            <View className="s-event-map-user-sheet__empty">
              <Text>暂无帖子</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
