import { memo, useMemo } from 'react';
import { MapPin, UserPlus } from '../../../components/icons';
import {
  PostCardActionBar,
  PostCommentSection,
  PostOwnerDeleteButton,
  PostOwnerEditButton,
  PostOwnerRecruitStatusButton,
  PostOwnerSlotStep,
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
import { resolveBuddyPostRecruitDisplay } from '../utils/parseBuddyPostRecruitDisplay';
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
  onEdit?: (post: EventDetailPost) => void;
  onRecruitStatusToggle?: (post: EventDetailPost) => void;
  onRecruitSlotsAdjust?: (post: EventDetailPost, delta: -1 | 1) => void;
  onCommentSubmitted?: (updated: Pick<EventDetailPost, 'id' | 'comments'>) => void;
};

function renderSlotsMeter(slotsTotal: number, slotsFilled: number) {
  const filled = Math.min(slotsFilled, slotsTotal);
  const percent = slotsTotal > 0 ? Math.round((filled / slotsTotal) * 100) : 0;

  return (
    <View className="s-event-post__slots-meter" aria-hidden>
      <View className="s-event-post__slots-track">
        <View className="s-event-post__slots-fill" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
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
  onEdit,
  onRecruitStatusToggle,
  onRecruitSlotsAdjust,
  onCommentSubmitted,
}: EventPostCardProps) {
  const t = useT();
  const displayIdentity = useDisplayUserIdentity();
  const displayBody = useMemo(
    () => stripPostBodyContact(post.bodyPreview || post.body || ''),
    [post.bodyPreview, post.body],
  );
  const recruitDisplay = useMemo(() => resolveBuddyPostRecruitDisplay(post), [post]);
  const departureCity = post.departureCity?.trim() ?? '';
  const meetingPoint = post.location?.trim() ?? '';
  const headerCity = departureCity || meetingPoint;
  const footerVenue =
    meetingPoint && headerCity && meetingPoint !== headerCity ? meetingPoint : '';
  const isOwn = isCurrentUserPostAuthor(post.name, post.userId);
  const isFull = recruitDisplay.recruitStatus === 'full';
  const isRecruiting = !isFull;
  const visibleTags = useMemo(() => {
    const raw = post.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
    if (!isFull) {
      return raw;
    }
    const withoutTeam = raw.filter((tag) => tag !== '#组队');
    return withoutTeam.length > 0 ? withoutTeam : ['#已满'];
  }, [post.tags, isFull]);
  const showApplyCta = !isOwn;
  const slotsTotal = recruitDisplay.slotsTotal;
  const slotsFilled = recruitDisplay.slotsFilled ?? (slotsTotal != null ? 1 : 0);
  const showProgress = isRecruiting && slotsTotal != null && slotsTotal > 0;
  const displayFilled = showProgress
    ? Math.min(Math.max(slotsFilled, 1), slotsTotal!)
    : 0;
  const showSlotsStepper = isOwn && showProgress && Boolean(onRecruitSlotsAdjust);

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

  const progressLabel = showProgress
    ? t('eventDetail.slotsProgress', {
        filled: String(displayFilled),
        total: String(slotsTotal),
      })
    : null;

  const handleSlotsDecrease = () => {
    onRecruitSlotsAdjust?.(post, -1);
  };

  const handleSlotsIncrease = () => {
    onRecruitSlotsAdjust?.(post, 1);
  };

  const statusLabel = isFull
    ? t('eventDetail.recruitStatusFull')
    : t('eventDetail.recruitStatusOpen');

  return (
    <View
      className={[
        's-event-post',
        isRecruiting && 's-event-post--recruiting',
        isFull && 's-event-post--full',
        highlighted && 's-event-post--highlight',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-event-post__header">
        <View
          className={[
            's-event-post__avatar-wrap',
            isRecruiting && 's-event-post__avatar-wrap--recruiting',
            isFull && 's-event-post__avatar-wrap--full',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <ImageWithFallback
            src={avatarSrc}
            alt={postName}
            imageClassName="s-event-post__avatar"
            placeholderClassName="s-event-post__avatar s-event-post__avatar--placeholder"
            fallback={postName.slice(0, 1)}
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
                  {headerCity ? `${headerCity} · ` : ''}
                  {publishTimeLabel}
                </Text>
              </View>
            </View>
            <View className="s-event-post__head-side">
              <View
                className={[
                  's-event-post__status-pill',
                  isFull
                    ? 's-event-post__status-pill--full'
                    : 's-event-post__status-pill--open',
                ].join(' ')}
              >
                <View
                  className={[
                    's-event-post__status-dot',
                    isFull && 's-event-post__status-dot--full',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                />
                <Text className="s-event-post__status-text">{statusLabel}</Text>
              </View>
              {isOwn && (onDelete || onEdit || onRecruitStatusToggle) ? (
                <View
                  className="s-event-post__head-actions"
                  onClick={stopClickPropagation}
                >
                  {onEdit ? (
                    <PostOwnerEditButton
                      ariaLabel={t('eventDetail.editPost')}
                      onEdit={() => onEdit(post)}
                    />
                  ) : null}
                  {onDelete ? (
                    <PostOwnerDeleteButton onDelete={() => onDelete(post)} />
                  ) : null}
                  {onRecruitStatusToggle ? (
                    <PostOwnerRecruitStatusButton
                      recruitStatus={recruitDisplay.recruitStatus}
                      onToggle={() => onRecruitStatusToggle(post)}
                    />
                  ) : null}
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
      </View>

      {displayBody ? <Text className="s-event-post__text">{displayBody}</Text> : null}

      {visibleTags.length > 0 || showProgress ? (
        <View className="s-event-post__meta-row">
          {visibleTags.length > 0 ? (
            <View className="s-event-post__content-badges s-content-badges">
              {visibleTags.map((tag) => (
                <Text
                  key={tag}
                  className={['s-event-post__tag', isFull && 's-event-post__tag--full']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
          {showProgress ? (
            <View
              className="s-event-post__slots"
              aria-label={progressLabel ?? undefined}
              onClick={stopClickPropagation}
            >
              <View className="s-event-post__slots-control">
                {showSlotsStepper ? (
                  <PostOwnerSlotStep
                    side="decrease"
                    disabled={displayFilled <= 1}
                    onPress={handleSlotsDecrease}
                  />
                ) : null}
                {renderSlotsMeter(slotsTotal!, displayFilled)}
                {showSlotsStepper ? (
                  <PostOwnerSlotStep
                    side="increase"
                    disabled={displayFilled >= slotsTotal!}
                    onPress={handleSlotsIncrease}
                  />
                ) : null}
              </View>
              <Text className="s-event-post__slots-label">{progressLabel}</Text>
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
              venueLabel={footerVenue}
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
              {!isFull ? <UserPlus size={16} color="#fff" aria-hidden /> : null}
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
    prev.post.location === next.post.location &&
    prev.post.departureCity === next.post.departureCity &&
    prev.post.recruitStatus === next.post.recruitStatus &&
    prev.post.slotsTotal === next.post.slotsTotal &&
    prev.post.slotsFilled === next.post.slotsFilled &&
    prev.post.comments === next.post.comments &&
    prev.post.tags === next.post.tags &&
    prev.highlighted === next.highlighted &&
    prev.commentsExpanded === next.commentsExpanded &&
    prev.commentDraft === next.commentDraft &&
    prev.publishTimeLabel === next.publishTimeLabel &&
    prev.currentUserAvatar === next.currentUserAvatar
  );
});
