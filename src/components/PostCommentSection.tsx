import "./PostCommentSection.scss";
import Taro from "@tarojs/taro";
import { useCallback, useState, type FC } from "react";
import { ChevronUp, Heart, Send } from "lucide-react-taro";
import { commentPostAndInvalidate, usePostCommentsQuery } from "../hooks/useSyncApi";
import { isApiEnabled } from "../constants/api";
import { PLACEHOLDER_AVATAR } from "../constants/remoteImages";
import { sanitizeRemoteImageUrl } from "../utils/imageUrl";
import { isCurrentUserPostAuthor } from "../utils/postOwnership";
import type { PostCommentItem } from "../types/backend";
import { Button, Image, Input, Text, View } from "@tarojs/components";

const DEFAULT_AVATAR = PLACEHOLDER_AVATAR;

export type PostCommentSectionProps = {
  postId: string;
  postAuthorName: string;
  postAuthorUserId?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  currentUserAvatar?: string;
  onCommentSubmitted?: () => void;
};

type ReplyTarget = {
  commentId: string;
  authorName: string;
};

type CommentRowProps = {
  comment: PostCommentItem;
  nested?: boolean;
  isPostAuthor: boolean;
  likedCommentIds: Set<string>;
  replyTargetId?: string;
  onToggleLike: (commentId: string) => void;
  onStartReply: (target: ReplyTarget) => void;
};

function CommentRow({
  comment,
  nested = false,
  isPostAuthor,
  likedCommentIds,
  replyTargetId,
  onToggleLike,
  onStartReply,
}: CommentRowProps) {
  const liked = likedCommentIds.has(comment.id);
  const isOwnComment = isCurrentUserPostAuthor(comment.authorName, comment.userId);
  const canReply = isPostAuthor && !isOwnComment && !nested && !comment.replies?.length;

  return (
    <>
      <View className={`s-post-comments__item${nested ? " s-post-comments__item--reply" : ""}`}>
        <Image
          className="s-post-comments__avatar"
          src={sanitizeRemoteImageUrl(comment.avatar) || DEFAULT_AVATAR}
        />
        <View className="s-post-comments__body-wrap">
          <View className="s-post-comments__meta">
            <Text className="s-post-comments__author">{comment.authorName}</Text>
            <Text className="s-post-comments__time">{comment.time}</Text>
          </View>
          <Text className="s-post-comments__bubble">{comment.body}</Text>
          <View className="s-post-comments__actions">
            <Button
              className={`s-post-comments__like${liked ? " s-post-comments__like--active" : ""}`}
              onClick={() => onToggleLike(comment.id)}
            >
              <Heart size={12} filled={liked} color={liked ? "#ff0066" : "#8e8e93"} />
              <Text className="s-btn-label">赞</Text>
            </Button>
            {canReply ? (
              <Button
                className={`s-post-comments__reply${replyTargetId === comment.id ? " s-post-comments__reply--active" : ""}`}
                onClick={() =>
                  onStartReply({
                    commentId: comment.id,
                    authorName: comment.authorName,
                  })
                }
              >
                <Text className="s-btn-label">回复</Text>
              </Button>
            ) : null}
          </View>
        </View>
      </View>
      {comment.replies?.map((reply) => (
        <CommentRow
          key={reply.id}
          comment={reply}
          nested
          isPostAuthor={isPostAuthor}
          likedCommentIds={likedCommentIds}
          onToggleLike={onToggleLike}
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
  const apiEnabled = isApiEnabled();
  const commentsQuery = usePostCommentsQuery(postId, expanded);
  const isPostAuthor = isCurrentUserPostAuthor(postAuthorName, postAuthorUserId);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(() => new Set());

  const placeholder = replyTarget ? `回复 @${replyTarget.authorName}` : "说点什么...";

  const handleSubmit = useCallback(() => {
    const body = draft.trim();
    if (!body || submitting) return;

    if (!apiEnabled) {
      void Taro.showToast({ title: "请开启 API 模式", icon: "none" });
      return;
    }

    setSubmitting(true);
    void commentPostAndInvalidate(postId, body, replyTarget?.commentId)
      .then(() => {
        setDraft("");
        setReplyTarget(null);
        onCommentSubmitted?.();
        void Taro.showToast({ title: "评论成功", icon: "success" });
      })
      .catch((err: { message?: string }) => {
        const message =
          typeof err?.message === "string" && err.message.trim() ? err.message : "评论失败";
        void Taro.showToast({ title: message, icon: "none" });
      })
      .finally(() => setSubmitting(false));
  }, [apiEnabled, draft, onCommentSubmitted, postId, replyTarget, submitting]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  const startReply = useCallback((target: ReplyTarget) => {
    setReplyTarget((prev) => (prev?.commentId === target.commentId ? null : target));
  }, []);

  const userAvatar = sanitizeRemoteImageUrl(currentUserAvatar?.trim()) || DEFAULT_AVATAR;
  const comments = commentsQuery.data ?? [];

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
          comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              isPostAuthor={isPostAuthor}
              likedCommentIds={likedCommentIds}
              replyTargetId={replyTarget?.commentId}
              onToggleLike={toggleCommentLike}
              onStartReply={startReply}
            />
          ))
        )}
      </View>

      <View className="s-post-comments__composer">
        <Image className="s-post-comments__avatar" src={userAvatar} />
        <View className="s-post-comments__input-wrap">
          <Input
            className="s-post-comments__input"
            value={draft}
            placeholder={placeholder}
            onInput={(e) => setDraft(e.detail.value)}
            onConfirm={() => {
              if (draft.trim()) handleSubmit();
            }}
          />
          <Button
            className="s-post-comments__send"
            aria-label="发送评论"
            disabled={!draft.trim() || submitting}
            onClick={handleSubmit}
          >
            <Send size={20} color="#fff" className="s-post-comments__send-icon" aria-hidden />
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
