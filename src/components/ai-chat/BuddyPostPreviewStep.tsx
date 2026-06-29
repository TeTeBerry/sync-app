import { useMemo } from 'react';
import { MapPin } from '../../components/icons';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { getBuddyPostAiDisclaimer } from '@/constants/aiDisclosure';
import { useDisplayUserIdentity } from '@/hooks/useDisplayUserIdentity';
import { useResolvedAvatarSrc } from '@/hooks/useResolvedAvatarSrc';
import { resolveAvatarDisplaySrc, thumbnailImageUrl } from '@/utils/imageUrl';
import { IMAGE_SIZE } from '@/constants/imageSizes';
import { stripPostBodyContact } from '@/utils/postBodyContact';
import { RecruitUnityTagChips } from '@/components/post/RecruitUnityTagChips';
import { resolveBuddyPostRecruitDisplay } from '@/domains/partner-feed/utils/parseBuddyPostRecruitDisplay';
import { formatPostHandle } from '@/domains/partner-feed/utils/eventPostDisplay';
import type { EventDetailPost } from '@/types/backend';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type BuddyPostPreviewStepProps = {
  post: EventDetailPost;
  activityTitle?: string;
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

export function BuddyPostPreviewStep({
  post,
  activityTitle,
}: BuddyPostPreviewStepProps) {
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
  const slotsTotal = recruitDisplay.slotsTotal;
  const slotsFilled = recruitDisplay.slotsFilled ?? (slotsTotal != null ? 1 : 0);
  const showProgress = slotsTotal != null && slotsTotal > 0;
  const displayFilled = showProgress
    ? Math.min(Math.max(slotsFilled, 1), slotsTotal!)
    : 0;
  const progressLabel = showProgress
    ? t('eventDetail.slotsProgress', {
        filled: String(displayFilled),
        total: String(slotsTotal),
      })
    : null;
  const visibleTags = (post.tags ?? []).filter((tag) => tag.trim());
  const postName =
    displayIdentity.name?.trim() || post.name?.trim() || t('common.user');
  const postHandle = formatPostHandle(postName, displayIdentity.handle);
  const avatarKey = displayIdentity.avatar?.trim() || post.avatar;
  const resolvedAvatarSrc = useResolvedAvatarSrc(avatarKey);
  const avatarSrc = resolveAvatarDisplaySrc(
    resolvedAvatarSrc,
    thumbnailImageUrl(avatarKey, IMAGE_SIZE.avatarSm) ?? avatarKey,
  );
  const previewTitle = activityTitle?.trim()
    ? t('ai.postPreview', { activity: activityTitle.trim() })
    : t('posts.previewTitle');

  return (
    <View className="s-ai-guide-plan-sheet__body s-ai-buddy-post-sheet__preview">
      <Text className="s-ai-buddy-post-sheet__preview-title">{previewTitle}</Text>
      <Text className="s-ai-buddy-post-sheet__ai-disclaimer">
        {getBuddyPostAiDisclaimer()}
      </Text>
      <Text className="s-ai-buddy-post-sheet__preview-hint">
        {t('posts.previewHint')}
      </Text>

      <View className="s-ai-buddy-post-sheet__preview-card s-event-post s-event-post--recruiting">
        <View className="s-event-post__header">
          <View className="s-event-post__avatar-wrap s-event-post__avatar-wrap--recruiting">
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
                    {t('posts.previewNow')}
                  </Text>
                </View>
              </View>
              <View className="s-event-post__head-side">
                <View className="s-event-post__status-pill s-event-post__status-pill--open">
                  <View className="s-event-post__status-dot" aria-hidden />
                  <Text className="s-event-post__status-text">
                    {t('eventDetail.recruitStatusOpen')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {displayBody ? <Text className="s-event-post__text">{displayBody}</Text> : null}

        <RecruitUnityTagChips tagIds={post.recruitUnityTags} />

        {visibleTags.length > 0 || showProgress ? (
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
            {showProgress ? (
              <View
                className="s-event-post__slots"
                aria-label={progressLabel ?? undefined}
              >
                <View className="s-event-post__slots-control">
                  {renderSlotsMeter(slotsTotal!, displayFilled)}
                </View>
                <Text className="s-event-post__slots-label">{progressLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
