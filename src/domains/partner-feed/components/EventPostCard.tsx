import { memo, useMemo } from 'react';
import { MapPin } from '../../../components/icons';
import {
  PostCardActionBar,
  PostCommentSection,
  PostOwnerDeleteButton,
} from '../../../components/post';
import { ContentReportMenuButton } from '../../../components/report';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { Button } from '../../../components/ui';
import { useDisplayUserIdentity } from '../../../hooks/useDisplayUserIdentity';
import { useResolvedAvatarSrc } from '../../../hooks/useResolvedAvatarSrc';
import { resolveAvatarDisplaySrc, thumbnailImageUrl } from '../../../utils/imageUrl';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { isCurrentUserPostAuthor } from '../../../utils/postOwnership';
import type { EventDetailPost } from '../../../types/backend';
import { stripPostBodyContact } from '../../../utils/postBodyContact';
import { formatPostHandle } from '../utils/eventPostDisplay';
import { parseBuddyPostRecruitDisplay } from '../utils/parseBuddyPostRecruitDisplay';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type EventPostCardProps = {
  post: EventDetailPost;
  publishTimeLabel: string;
  highlighted: boolean;
  commentsExpanded: boolean;
  currentUserAvatar?: string;
  commentDraft?: string;
  onOpenComments: (postId: string) => void;
  onApplyJoin: (postId: string) => void;
  onCloseComments: (postId: string) => void;
  onDelete?: (post: EventDetailPost) => void;
  onCommentSubmitted?: (updated: Pick<EventDetailPost, 'id' | 'comments'>) => void;
};

function renderProgressDots(slotsTotal: number, slotsFilled: number) {
  const dots = [];
  for (let index = 0; index < slotsTotal; index += 1) {
    dots.push(
      <View
        key={index}
        className={[
          's-event-post__progress-dot',
          index < slotsFilled && 's-event-post__progress-dot--filled',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      />,
    );
  }
  return dots;
}

function EventPostCardInner({
  post,
  publishTimeLabel,
  highlighted,
  commentsExpanded,
  currentUserAvatar,
  commentDraft,
  onOpenComments,
  onApplyJoin,
  onCloseComments,
  onDelete,
  onCommentSubmitted,
}: EventPostCardProps) {
  const t = useT();
  const displayIdentity = useDisplayUserIdentity();
  const displayBody = useMemo(
    () => stripPostBodyContact(post.bodyPreview || post.body || ''),
    [post.bodyPreview, post.body],
  );
  const recruitDisplay = useMemo(
    () => parseBuddyPostRecruitDisplay(post.bodyPreview || post.body || ''),
    [post.bodyPreview, post.body],
  );
  const submetaLocation = post.location?.trim() ?? '';
  const visibleTags = useMemo(
    () => post.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    [post.tags],
  );

  const isOwn = isCurrentUserPostAuthor(post.name, post.userId);
  const isFull = recruitDisplay.recruitStatus === 'full';
  const showApplyCta = !isOwn;
  const slotsTotal = recruitDisplay.slotsTotal;
  const slotsFilled = recruitDisplay.slotsFilled ?? 0;

  const postName = isOwn
    ? displayIdentity.name?.trim() || post.name?.trim() || t('common.user')
    : post.name?.trim() || t('common.user');

  const postHandle = formatPostHandle(
    postName,
    isOwn ? displayIdentity.handle : post.handle,
  );

  const avatarKey = isOwn ? displayIdentity.avatar?.trim() || post.avatar : post.avatar;
  const resolvedAvatarSrc = useResolvedAvatarSrc(avatarKey);
  const avatarSrc = resolveAvatarDisplaySrc(
    resolvedAvatarSrc,
    thumbnailImageUrl(avatarKey, IMAGE_SIZE.avatarSm) ?? avatarKey,
  );

  const stopClickPropagation = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
  };

  const handleApplyJoin = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
    if (isFull) {
      return;
    }
    onApplyJoin(post.id);
  };

  const progressLabel =
    slotsTotal != null && recruitDisplay.slotsFilled != null
      ? t('eventDetail.slotsProgress', {
          filled: String(slotsFilled),
          total: String(slotsTotal),
        })
      : slotsTotal != null
        ? t('eventDetail.slotsRecruiting', { total: String(slotsTotal) })
        : null;

  return (
    <View
      className={['s-event-post', highlighted && 's-event-post--highlight']
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-event-post__header">
        <View className="s-event-post__avatar-wrap">
          <ImageWithFallback
            src={avatarSrc}
            alt={postName}
            imageClassName="s-event-post__avatar"
            placeholderClassName="s-event-post__avatar s-event-post__avatar--placeholder"
            fallback={postName.slice(0, 1)}
          />
          <View
            className={[
              's-event-post__avatar-badge',
              isFull
                ? 's-event-post__avatar-badge--done'
                : 's-event-post__avatar-badge--recruit',
            ].join(' ')}
            aria-hidden
          />
        </View>
        <View className="s-event-post__head-main">
          <View className="s-event-post__top">
            <View className="s-event-post__identity">
              <View className="s-event-post__name-row">
                <Text className="s-event-post__user-name">{postName}</Text>
                <Text className="s-event-post__user-handle">{postHandle}</Text>
              </View>
              <View className="s-event-post__submeta">
                <MapPin size={12} color="#8e8e93" aria-hidden />
                <Text className="s-event-post__submeta-text">
                  {submetaLocation ? `${submetaLocation} · ` : ''}
                  {publishTimeLabel}
                </Text>
              </View>
            </View>
            {isOwn && onDelete ? (
              <View
                className="s-event-post__head-actions"
                onClick={stopClickPropagation}
              >
                <PostOwnerDeleteButton onDelete={() => onDelete(post)} />
              </View>
            ) : !isOwn ? (
              <View
                className="s-event-post__head-actions"
                onClick={stopClickPropagation}
              >
                <ContentReportMenuButton
                  targetType="post"
                  targetId={post.id}
                  targetUserId={post.userId}
                />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {displayBody ? <Text className="s-event-post__text">{displayBody}</Text> : null}

      {visibleTags.length > 0 || progressLabel ? (
        <View className="s-event-post__meta-row">
          {visibleTags.length > 0 ? (
            <View className="s-event-post__content-badges s-content-badges">
              {visibleTags.map((tag) => (
                <Text key={tag} className="s-event-post__tag">
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
          {progressLabel ? (
            <View className="s-event-post__progress" aria-label={progressLabel}>
              {slotsTotal != null && recruitDisplay.slotsFilled != null
                ? renderProgressDots(slotsTotal, slotsFilled)
                : null}
              <Text className="s-event-post__progress-label">{progressLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="s-event-post__footer">
        <View className="s-event-post__footer-divider" aria-hidden />
        <View className="s-event-post__footer-row">
          <View className="s-event-post__footer-left">
            <PostCardActionBar
              comments={post.comments ?? 0}
              commentsExpanded={commentsExpanded}
              onToggleComments={() =>
                commentsExpanded ? onCloseComments(post.id) : onOpenComments(post.id)
              }
            />
          </View>
          {showApplyCta ? (
            <Button
              className={[
                's-event-post__cta',
                isFull ? 's-event-post__cta--done' : 's-event-post__cta--apply',
              ].join(' ')}
              disabled={isFull}
              onClick={handleApplyJoin}
            >
              <Text className="s-event-post__cta-text">
                {isFull
                  ? t('eventDetail.applyJoinDisabled')
                  : t('eventDetail.applyJoin')}
              </Text>
            </Button>
          ) : null}
        </View>
      </View>

      {commentsExpanded ? (
        <PostCommentSection
          postId={post.id}
          postAuthorName={postName}
          postAuthorUserId={post.userId}
          expanded
          onToggleExpanded={() => onCloseComments(post.id)}
          currentUserAvatar={currentUserAvatar}
          onCommentSubmitted={onCommentSubmitted}
          initialCommentDraft={commentDraft}
          showApplyJoinHint={Boolean(commentDraft?.trim())}
        />
      ) : null}
    </View>
  );
}

export const EventPostCard = memo(EventPostCardInner, (prev, next) => {
  return (
    prev.post.id === next.post.id &&
    prev.post.body === next.post.body &&
    prev.post.bodyPreview === next.post.bodyPreview &&
    prev.post.comments === next.post.comments &&
    prev.post.tags === next.post.tags &&
    prev.highlighted === next.highlighted &&
    prev.commentsExpanded === next.commentsExpanded &&
    prev.commentDraft === next.commentDraft &&
    prev.publishTimeLabel === next.publishTimeLabel &&
    prev.currentUserAvatar === next.currentUserAvatar
  );
});
