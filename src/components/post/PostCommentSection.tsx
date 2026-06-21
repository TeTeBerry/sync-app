import './PostCommentSection.scss';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { ChevronUp, Send } from '../icons';
import { useUgcPublishGuard } from '../../hooks/useUgcPublishGuard';
import { commentPostAndInvalidate, usePostCommentsQuery } from '../../hooks/sync/posts';
import { requireAuth } from '../../utils/authGate';
import { getUgcContactValidationError } from '../../utils/ugcContactValidation';
import { requestPostEngagementSubscribe } from '../../utils/wechatSubscribeMessage';
import { PLACEHOLDER_AVATAR } from '../../constants/remoteImages';
import { useResolvedAvatarSrc } from '../../hooks/useResolvedAvatarSrc';
import { resolveAvatarDisplaySrc, thumbnailImageUrl } from '../../utils/imageUrl';
import { IMAGE_SIZE } from '../../constants/imageSizes';
import {
  POST_COMMENTS_INITIAL_RENDER,
  POST_COMMENTS_MAX_VISIBLE,
  POST_COMMENTS_RENDER_STEP,
  POST_COMMENT_REPLIES_PREVIEW,
} from '../../constants/listPerf';
import { useWindowedList } from '../../hooks/useWindowedList';
import {
  isCommentByPostAuthor,
  isCurrentUserPostAuthor,
} from '../../utils/postOwnership';
import type { EventDetailPost, PostCommentItem } from '../../types/backend';
import { Button, cn, Input } from '../ui';
import { ContentReportMenuButton } from '../report';
import { Image, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

const DEFAULT_AVATAR = PLACEHOLDER_AVATAR;

export type PostCommentSectionProps = {
  postId: string;
  postAuthorName: string;
  postAuthorUserId?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  currentUserAvatar?: string;
  onCommentSubmitted?: (updated: Pick<EventDetailPost, 'id' | 'comments'>) => void;
  initialCommentDraft?: string | null;
  showApplyJoinHint?: boolean;
};

type ReplyTarget = {
  commentId: string;
  authorName: string;
};

type CommentRowProps = {
  comment: PostCommentItem;
  nested?: boolean;
  isPostAuthor: boolean;
  postAuthorName: string;
  postAuthorUserId?: string;
  replyTargetId?: string;
  onStartReply: (target: ReplyTarget) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

function CommentRow({
  comment,
  nested = false,
  isPostAuthor,
  postAuthorName,
  postAuthorUserId,
  replyTargetId,
  onStartReply,
  t,
}: CommentRowProps) {
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const resolvedAvatar = useResolvedAvatarSrc(comment.avatar);
  const avatarSrc = resolveAvatarDisplaySrc(
    resolvedAvatar,
    thumbnailImageUrl(comment.avatar, IMAGE_SIZE.avatarSm) ?? comment.avatar,
    DEFAULT_AVATAR,
  );
  const isPostAuthorComment = isCommentByPostAuthor(
    comment.authorName,
    comment.userId,
    postAuthorName,
    postAuthorUserId,
  );
  const isOwnComment = isCurrentUserPostAuthor(comment.authorName, comment.userId);
  const canReply =
    isPostAuthor && !isPostAuthorComment && !nested && !comment.replies?.length;

  return (
    <>
      <View
        className={`s-post-comments__item${nested ? ' s-post-comments__item--reply' : ''}`}
      >
        <Image className="s-post-comments__avatar" src={avatarSrc} lazyLoad />
        <View className="s-post-comments__body-wrap">
          <View className="s-post-comments__meta-row">
            <View className="s-post-comments__meta">
              <Text className="s-post-comments__author">{comment.authorName}</Text>
              <Text className="s-post-comments__time">{comment.time}</Text>
            </View>
            {!isOwnComment ? (
              <ContentReportMenuButton
                targetType="comment"
                targetId={comment.id}
                targetUserId={comment.userId}
                ariaLabel={t('comments.reportAria')}
              />
            ) : null}
          </View>
          <Text className="s-post-comments__body">{comment.body}</Text>
          {canReply ? (
            <View className="s-post-comments__actions">
              <Button
                className={`s-post-comments__reply${replyTargetId === comment.id ? ' s-post-comments__reply--active' : ''}`}
                onClick={() =>
                  onStartReply({
                    commentId: comment.id,
                    authorName: comment.authorName,
                  })
                }
              >
                <Text className="s-btn-label">{t('comments.reply')}</Text>
              </Button>
            </View>
          ) : null}
        </View>
      </View>
      {(() => {
        const replies = comment.replies ?? [];
        if (!replies.length) return null;
        const visibleReplies = repliesExpanded
          ? replies
          : replies.slice(0, POST_COMMENT_REPLIES_PREVIEW);
        const hiddenCount = replies.length - visibleReplies.length;
        return (
          <>
            {visibleReplies.map((reply) => (
              <CommentRow
                key={reply.id}
                comment={reply}
                nested
                isPostAuthor={isPostAuthor}
                postAuthorName={postAuthorName}
                postAuthorUserId={postAuthorUserId}
                onStartReply={onStartReply}
                t={t}
              />
            ))}
            {hiddenCount > 0 && !repliesExpanded ? (
              <Button
                className="s-post-comments__replies-more"
                onClick={() => setRepliesExpanded(true)}
              >
                <Text className="s-btn-label">
                  {t('comments.repliesMore', { count: hiddenCount })}
                </Text>
              </Button>
            ) : null}
          </>
        );
      })()}
    </>
  );
}

export const PostCommentSection: FC<PostCommentSectionProps> = ({
  postId,
  postAuthorName,
  postAuthorUserId,
  expanded,
  onToggleExpanded,
  currentUserAvatar,
  onCommentSubmitted,
  initialCommentDraft,
  showApplyJoinHint = false,
}) => {
  const t = useT();
  const commentsQuery = usePostCommentsQuery(postId, expanded);
  const { guardPublish, handlePublishError, complianceConfirmDialog } =
    useUgcPublishGuard();
  const { hasMore, loadMore, loadingMore } = commentsQuery;
  const isPostAuthor = isCurrentUserPostAuthor(postAuthorName, postAuthorUserId);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const appliedDraftRef = useRef<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const nextDraft = initialCommentDraft?.trim();
    if (!nextDraft) return;
    if (appliedDraftRef.current === nextDraft) return;
    setDraft(nextDraft);
    appliedDraftRef.current = nextDraft;
  }, [expanded, initialCommentDraft]);

  const placeholder = replyTarget
    ? t('comments.replyTo', { name: replyTarget.authorName })
    : t('comments.placeholder');

  const handleSubmit = useCallback(() => {
    const body = draft.trim();
    if (!body || submitting) return;

    const contactError = getUgcContactValidationError(body);
    if (contactError) {
      void Taro.showToast({ title: contactError, icon: 'none' });
      return;
    }

    const submitComment = () => {
      void (async () => {
        if (!(await guardPublish())) return;
        setSubmitting(true);
        try {
          const updated = await commentPostAndInvalidate(
            postId,
            body,
            replyTarget?.commentId,
          );
          setDraft('');
          setReplyTarget(null);
          onCommentSubmitted?.(updated);
          void Taro.showToast({ title: t('comments.submitSuccess'), icon: 'success' });
          void requestPostEngagementSubscribe();
        } catch (err: unknown) {
          if (await handlePublishError(err)) return;
          const message =
            err instanceof Error && err.message.trim()
              ? err.message.trim()
              : t('comments.submitFailed');
          void Taro.showToast({ title: message, icon: 'none' });
        } finally {
          setSubmitting(false);
        }
      })();
    };

    requireAuth(submitComment, 'social');
  }, [
    draft,
    guardPublish,
    handlePublishError,
    onCommentSubmitted,
    postId,
    replyTarget,
    submitting,
    t,
  ]);

  const startReply = useCallback((target: ReplyTarget) => {
    setReplyTarget((prev) => (prev?.commentId === target.commentId ? null : target));
  }, []);

  const resolvedCurrentUserAvatar = useResolvedAvatarSrc(currentUserAvatar);
  const userAvatar = resolveAvatarDisplaySrc(
    resolvedCurrentUserAvatar,
    currentUserAvatar,
    DEFAULT_AVATAR,
  );
  const comments = commentsQuery.data ?? [];
  const {
    visibleItems: visibleComments,
    hasMoreToShow: hasMoreVisibleComments,
    showMore: showMoreVisibleComments,
  } = useWindowedList(comments, {
    initialSize: POST_COMMENTS_INITIAL_RENDER,
    step: POST_COMMENTS_RENDER_STEP,
    maxVisible: POST_COMMENTS_MAX_VISIBLE,
  });
  const canSend = Boolean(draft.trim()) && !submitting;
  const isEmptyList =
    !commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0;

  if (!expanded) return null;

  return (
    <View
      className="s-post-comments"
      aria-label={t('comments.replyTo', { name: '帖子' })}
    >
      <View
        className={cn(
          's-post-comments__list',
          isEmptyList && 's-post-comments__list--empty',
        )}
      >
        {commentsQuery.isLoading ? (
          <Text className="s-post-comments__status">{t('comments.loading')}</Text>
        ) : commentsQuery.isError ? (
          <Text className="s-post-comments__status">{t('comments.loadFailed')}</Text>
        ) : comments.length === 0 ? (
          <Text className="s-post-comments__status">{t('comments.empty')}</Text>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                isPostAuthor={isPostAuthor}
                postAuthorName={postAuthorName}
                postAuthorUserId={postAuthorUserId}
                replyTargetId={replyTarget?.commentId}
                onStartReply={startReply}
                t={t}
              />
            ))}
            {hasMoreVisibleComments ? (
              <Button
                className="s-post-comments__load-more"
                onClick={showMoreVisibleComments}
              >
                <Text className="s-btn-label">{t('comments.showMore')}</Text>
              </Button>
            ) : null}
            {hasMore ? (
              <Button
                className="s-post-comments__load-more"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                <Text className="s-btn-label">
                  {loadingMore ? t('comments.loading') : t('comments.loadMore')}
                </Text>
              </Button>
            ) : null}
          </>
        )}
      </View>

      {replyTarget ? (
        <View className="s-post-comments__reply-bar">
          <Text className="s-post-comments__reply-bar-text">
            {t('comments.replyTo', { name: replyTarget.authorName })}
          </Text>
          <Button
            className="s-post-comments__reply-bar-cancel"
            onClick={() => setReplyTarget(null)}
          >
            <Text className="s-btn-label">{t('comments.cancelReply')}</Text>
          </Button>
        </View>
      ) : null}

      {showApplyJoinHint ? (
        <Text className="s-post-comments__apply-hint">
          {t('eventDetail.applyJoinPublicHint')}
        </Text>
      ) : null}

      <View className="s-post-comments__composer">
        <Image
          className="s-post-comments__avatar"
          src={userAvatar}
          mode="aspectFill"
          lazyLoad
        />
        <View
          className={cn(
            's-post-comments__input-wrap',
            canSend && 's-post-comments__input-wrap--active',
          )}
        >
          <Input
            className="s-post-comments__input"
            value={draft}
            placeholder={placeholder}
            confirmType="send"
            adjustPosition={false}
            onInput={(e) => setDraft(e.detail.value)}
            onConfirm={() => {
              if (canSend) handleSubmit();
            }}
          />
          <Button
            className={cn(
              's-post-comments__send',
              canSend && 's-post-comments__send--active',
            )}
            aria-label={t('comments.send')}
            disabled={!canSend}
            onClick={handleSubmit}
          >
            <Send
              size={18}
              color={canSend ? '#fff' : '#8e8e93'}
              className="s-post-comments__send-icon"
              aria-hidden
            />
          </Button>
        </View>
      </View>

      <Button className="s-post-comments__toggle" onClick={onToggleExpanded}>
        <Text className="s-btn-label">{t('comments.collapse')}</Text>
        <ChevronUp size={14} />
      </Button>

      {complianceConfirmDialog}
    </View>
  );
};
