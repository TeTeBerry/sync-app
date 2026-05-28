import "./PostCommentSection.scss";
import Taro from "@tarojs/taro";
import { useCallback, useState, type FC } from "react";
import { ChevronUp, Heart, Send } from "lucide-react-taro";
import { commentPostAndInvalidate, usePostCommentsQuery } from "../hooks/useSyncApi";
import { isApiEnabled } from "../constants/api";
import { PLACEHOLDER_AVATAR } from "../constants/remoteImages";
import { sanitizeRemoteImageUrl } from "../utils/imageUrl";
import { Button, Image, Input, Text, View } from '@tarojs/components';

const DEFAULT_AVATAR = PLACEHOLDER_AVATAR;

export type PostCommentSectionProps = {
  postId: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  currentUserAvatar?: string;
  onCommentSubmitted?: () => void;
};

export const PostCommentSection: FC<PostCommentSectionProps> = ({
  postId,
  expanded,
  onToggleExpanded,
  currentUserAvatar,
  onCommentSubmitted,
}) => {
  const apiEnabled = isApiEnabled();
  const commentsQuery = usePostCommentsQuery(postId, expanded);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(() => new Set());

  const handleSubmit = useCallback(() => {
    const body = draft.trim();
    if (!body || submitting) return;

    if (!apiEnabled) {
      void Taro.showToast({ title: "请开启 API 模式", icon: "none" });
      return;
    }

    setSubmitting(true);
    void commentPostAndInvalidate(postId, body)
      .then(() => {
        setDraft("");
        onCommentSubmitted?.();
        void Taro.showToast({ title: "评论成功", icon: "success" });
      })
      .catch(() => void Taro.showToast({ title: "评论失败", icon: "none" }))
      .finally(() => setSubmitting(false));
  }, [apiEnabled, draft, onCommentSubmitted, postId, submitting]);

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

  const userAvatar =
    sanitizeRemoteImageUrl(currentUserAvatar?.trim()) || DEFAULT_AVATAR;
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
          comments.map((comment) => {
            const liked = likedCommentIds.has(comment.id);

            return (
              <View key={comment.id} className="s-post-comments__item">
                <Image
                  className="s-post-comments__avatar"
                  src={sanitizeRemoteImageUrl(comment.avatar) || DEFAULT_AVATAR}
                />
                <View className="s-post-comments__body-wrap">
                  <View className="s-post-comments__meta">
                    <Text style={{fontWeight:"bold"}}>{comment.authorName}</Text>
                    <Text>{comment.time}</Text>
                  </View>
                  <Text className="s-post-comments__bubble">{comment.body}</Text>
                  <Button className={`s-post-comments__like${liked ? " s-post-comments__like--active" : ""}`}
                    onClick={() => toggleCommentLike(comment.id)}>
                    <Heart size={12} filled={liked} color={liked ? "#ff0066" : "#8e8e93"} />
                    <Text className="s-btn-label">赞</Text>
                  </Button>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View className="s-post-comments__composer">
        <Image className="s-post-comments__avatar" src={userAvatar} />
        <View className="s-post-comments__input-wrap">
          <Input
            className="s-post-comments__input"
            value={draft}
            placeholder="说点什么..."
            onInput={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) handleSubmit();
            }}
          />
          <Button className="s-post-comments__send"
            aria-label="发送评论"
            disabled={!draft.trim() || submitting}
            onClick={handleSubmit}>
            <Send size={14} />
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
