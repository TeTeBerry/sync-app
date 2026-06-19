import './PostCommentSection.scss';
import Taro from '@tarojs/taro';
import { useCallback, useState, type FC } from 'react';
import { ChevronUp, Send } from '../icons';
import { useUgcPublishGuard } from '../../hooks/useUgcPublishGuard';
import { commentPostAndInvalidate, usePostCommentsQuery } from '../../hooks/sync/posts';
import { requireAuth } from '../../utils/authGate';
import { getUgcContactValidationError } from '../../utils/ugcContactValidation';
import { requestPostEngagementSubscribe } from '../../utils/wechatSubscribeMessage';
import { PLACEHOLDER_AVATAR } from '../../constants/remoteImages';
import { useResolvedAvatarSrc } from '../../hooks/useResolvedAvatarSrc';
import { resolveAvatarDisplaySrc } from '../../utils/imageUrl';
import {
  isCommentByPostAuthor,
  isCurrentUserPostAuthor,
} from '../../utils/postOwnership';
import type { EventDetailPost, PostCommentItem } from '../../types/backend';
import { Button, cn, Input } from '../ui';
import { ContentReportMenuButton } from '../report';
import { Image, Text, View } from '@tarojs/components';

const DEFAULT_AVATAR = PLACEHOLDER_AVATAR;

export type PostCommentSectionProps = {
  postId: string;
  postAuthorName: string;
  postAuthorUserId?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  currentUserAvatar?: string;
  onCommentSubmitted?: (updated: Pick<EventDetailPost, 'id' | 'comments'>) => void;
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
};

function CommentRow({
  comment,
  nested = false,
  isPostAuthor,
  postAuthorName,
  postAuthorUserId,
  replyTargetId,
  onStartReply,
}: CommentRowProps) {
  const resolvedAvatar = useResolvedAvatarSrc(comment.avatar);
  const avatarSrc = resolveAvatarDisplaySrc(
    resolvedAvatar,
    comment.avatar,
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
        <Image className="s-post-comments__avatar" src={avatarSrc} />
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
                ariaLabel="举报评论"
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
                <Text className="s-btn-label">回复</Text>
              </Button>
            </View>
          ) : null}
        </View>
      </View>
      {comment.replies?.map((reply) => (
        <CommentRow
          key={reply.id}
          comment={reply}
          nested
          isPostAuthor={isPostAuthor}
          postAuthorName={postAuthorName}
          postAuthorUserId={postAuthorUserId}
          onStartReply={onStartReply}
        />
      ))}
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
}) => {
  const commentsQuery = usePostCommentsQuery(postId, expanded);
  const { guardPublish, handlePublishError, complianceConfirmDialog } =
    useUgcPublishGuard();
  const { hasMore, loadMore, loadingMore } = commentsQuery;
  const isPostAuthor = isCurrentUserPostAuthor(postAuthorName, postAuthorUserId);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  const placeholder = replyTarget ? `回复 @${replyTarget.authorName}` : '说点什么...';

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
          void Taro.showToast({ title: '评论成功', icon: 'success' });
          void requestPostEngagementSubscribe();
        } catch (err: unknown) {
          if (await handlePublishError(err)) return;
          const message =
            err instanceof Error && err.message.trim()
              ? err.message.trim()
              : '评论失败';
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
  const canSend = Boolean(draft.trim()) && !submitting;
  const isEmptyList =
    !commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0;

  if (!expanded) return null;

  return (
    <View className="s-post-comments" aria-label="帖子评论">
      <View
        className={cn(
          's-post-comments__list',
          isEmptyList && 's-post-comments__list--empty',
        )}
      >
        {commentsQuery.isLoading ? (
          <Text className="s-post-comments__status">加载中…</Text>
        ) : commentsQuery.isError ? (
          <Text className="s-post-comments__status">评论加载失败</Text>
        ) : comments.length === 0 ? (
          <Text className="s-post-comments__status">暂无评论，来抢沙发吧</Text>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                isPostAuthor={isPostAuthor}
                postAuthorName={postAuthorName}
                postAuthorUserId={postAuthorUserId}
                replyTargetId={replyTarget?.commentId}
                onStartReply={startReply}
              />
            ))}
            {hasMore ? (
              <Button
                className="s-post-comments__load-more"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                <Text className="s-btn-label">
                  {loadingMore ? '加载中…' : '加载更多评论'}
                </Text>
              </Button>
            ) : null}
          </>
        )}
      </View>

      {replyTarget ? (
        <View className="s-post-comments__reply-bar">
          <Text className="s-post-comments__reply-bar-text">
            回复 @{replyTarget.authorName}
          </Text>
          <Button
            className="s-post-comments__reply-bar-cancel"
            onClick={() => setReplyTarget(null)}
          >
            <Text className="s-btn-label">取消</Text>
          </Button>
        </View>
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
            aria-label="发送评论"
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
        <Text className="s-btn-label">收起评论</Text>
        <ChevronUp size={14} />
      </Button>

      {complianceConfirmDialog}
    </View>
  );
};
