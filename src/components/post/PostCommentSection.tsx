import './PostCommentSection.scss';
import Taro from '@tarojs/taro';
import { useCallback, useState, type FC } from 'react';
import { ChevronUp, Send } from '../icons';
import { useAccountRisk } from '../../hooks/useAccountRisk';
import { commentPostAndInvalidate, usePostCommentsQuery } from '../../hooks/sync/posts';
import { requireAuth } from '../../utils/authGate';
import { PLACEHOLDER_AVATAR } from '../../constants/remoteImages';
import { sanitizeRemoteImageUrl } from '../../utils/imageUrl';
import {
  isCommentByPostAuthor,
  isCurrentUserPostAuthor,
} from '../../utils/postOwnership';
import type { EventDetailPost, PostCommentItem } from '../../types/backend';
import { Button, cn, Input } from '../ui';
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
  const isPostAuthorComment = isCommentByPostAuthor(
    comment.authorName,
    comment.userId,
    postAuthorName,
    postAuthorUserId,
  );
  const canReply =
    isPostAuthor && !isPostAuthorComment && !nested && !comment.replies?.length;

  return (
    <>
      <View
        className={`s-post-comments__item${nested ? ' s-post-comments__item--reply' : ''}`}
      >
        <Image
          className="s-post-comments__avatar"
          src={sanitizeRemoteImageUrl(comment.avatar) || DEFAULT_AVATAR}
        />
        <View className="s-post-comments__body-wrap">
          <View className="s-post-comments__meta">
            <Text className="s-post-comments__author">{comment.authorName}</Text>
            <Text className="s-post-comments__time">{comment.time}</Text>
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
  const { guardPublish, handlePublishError } = useAccountRisk();
  const { hasMore, loadMore, loadingMore } = commentsQuery;
  const isPostAuthor = isCurrentUserPostAuthor(postAuthorName, postAuthorUserId);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  const placeholder = replyTarget ? `回复 @${replyTarget.authorName}` : '说点什么...';

  const handleSubmit = useCallback(() => {
    const body = draft.trim();
    if (!body || submitting) return;

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

  const userAvatar =
    sanitizeRemoteImageUrl(currentUserAvatar?.trim()) || DEFAULT_AVATAR;
  const comments = commentsQuery.data ?? [];
  const canSend = Boolean(draft.trim()) && !submitting;

  if (!expanded) return null;

  return (
    <View className="s-post-comments" aria-label="帖子评论">
      <View className="s-post-comments__list">
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
    </View>
  );
};
