import "./event-detail.scss";
import Taro from "@tarojs/taro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  HeartIcon,
  MapIcon,
  MessageCircleIcon,
  SendIcon,
  Share2Icon,
  SparklesIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { goAiAssistant, goBack, ROUTES } from "../../utils/route";
import BottomNav from "../../components/BottomNav";
import {
  applyToPostAndInvalidate,
  commentPostAndInvalidate,
  deletePostAndInvalidate,
  likePostAndInvalidate,
  useActivityDetailQuery,
  useEventPostsQuery,
} from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { promptText } from "../../utils/promptText";
import { isCurrentUserPostAuthor } from "../../utils/postOwnership";
import { getEventDetail, type EventTeamPost } from "./eventDetailData";
import {
  getTopAiShortcutTags,
  isAiShortcutTag,
  recordAiShortcutTagUse,
} from "../../utils/aiShortcutTags";
import {
  activityStatusBadgeClass,
  activityStatusI18nKey,
  getActivityStatusFromActivity,
} from "../../utils/activityStatus";
import {
  eventPostStatusClass,
  eventPostStatusI18nKey,
  toEventPostCardStatus,
} from "../../utils/postStatus";

const EventDetailPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const eventId = Number(Taro.getCurrentInstance().router?.params?.id);
  const highlightPostId = Taro.getCurrentInstance().router?.params?.postId?.trim() || "";
  const apiEnabled = isApiEnabled();
  const mockDetail = useMemo(
    () => (Number.isNaN(eventId) ? null : getEventDetail(eventId)),
    [eventId],
  );
  const activityQuery = useActivityDetailQuery(eventId);
  const postsQuery = useEventPostsQuery(eventId);
  const [prompt, setPrompt] = useState("");
  const [shortcutTags, setShortcutTags] = useState(() => getTopAiShortcutTags());
  const [appliedPostIds, setAppliedPostIds] = useState<Set<string>>(() => new Set());
  const highlightedPostRef = useRef<HTMLElement | null>(null);

  const title = apiEnabled ? activityQuery.data?.name : mockDetail?.title;
  const activityDate = apiEnabled ? activityQuery.data?.date : mockDetail?.date;
  const activityStatus = getActivityStatusFromActivity(activityDate, title);
  const metaLine = useMemo(() => {
    if (apiEnabled && activityQuery.data) {
      const parts = [activityQuery.data.date, activityQuery.data.location].filter(Boolean);
      return parts.join(" · ");
    }
    if (mockDetail) {
      const parts = [mockDetail.date, mockDetail.location].filter(Boolean);
      return parts.join(" · ");
    }
    return "";
  }, [activityQuery.data, apiEnabled, mockDetail]);

  const posts: EventTeamPost[] = useMemo(() => {
    if (apiEnabled && postsQuery.data) {
      return postsQuery.data.map((item) => ({
        id: item.id,
        name: item.name,
        location: item.location,
        time: item.time,
        body: item.body,
        tags: item.tags,
        likes: item.likes,
        comments: item.comments,
        avatar: item.avatar,
        status: item.status,
      }));
    }
    return mockDetail?.posts ?? [];
  }, [apiEnabled, mockDetail?.posts, postsQuery.data]);

  useEffect(() => {
    if (!highlightPostId || !highlightedPostRef.current) return;
    highlightedPostRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightPostId, posts.length, postsQuery.isLoading]);

  const handleApply = useCallback(
    (postId: string) => {
      if (appliedPostIds.has(postId)) return;

      if (!apiEnabled) {
        setAppliedPostIds((prev) => new Set(prev).add(postId));
        return;
      }

      void applyToPostAndInvalidate(queryClient, postId)
        .then(() => {
          setAppliedPostIds((prev) => new Set(prev).add(postId));
          void Taro.showToast({ title: "已申请", icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: "申请失败", icon: "none" }));
    },
    [apiEnabled, appliedPostIds, queryClient],
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      if (!apiEnabled) {
        void Taro.showToast({ title: "已点赞", icon: "none" });
        return;
      }
      void likePostAndInvalidate(queryClient, postId)
        .then(() => void postsQuery.refetch())
        .catch(() => void Taro.showToast({ title: "操作失败", icon: "none" }));
    },
    [apiEnabled, postsQuery, queryClient],
  );

  const handleCommentPost = useCallback(
    (postId: string) => {
      if (!apiEnabled) {
        void Taro.showToast({ title: "请开启 API 模式", icon: "none" });
        return;
      }
      const body = promptText("写评论");
      if (!body) return;
      void commentPostAndInvalidate(queryClient, postId, body)
        .then(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: "评论成功", icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: "评论失败", icon: "none" }));
    },
    [apiEnabled, postsQuery, queryClient],
  );

  const handleDeletePost = useCallback(
    (post: EventTeamPost) => {
      void Taro.showModal({
        title: "确认删除",
        content: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (!res.confirm) return;
          if (!apiEnabled) {
            void Taro.showToast({ title: "已删除", icon: "success" });
            return;
          }
          void deletePostAndInvalidate(queryClient, post.id)
            .then(() => {
              void Taro.showToast({ title: "已删除", icon: "success" });
            })
            .catch(() => {
              void postsQuery.refetch();
              void Taro.showToast({ title: "删除失败", icon: "none" });
            });
        },
      });
    },
    [apiEnabled, postsQuery, queryClient],
  );

  const bumpShortcutTagUsage = useCallback((tag: string) => {
    recordAiShortcutTagUse(tag);
    setShortcutTags(getTopAiShortcutTags());
  }, []);

  const openAi = useCallback(
    (message?: string) => {
      const trimmed = message?.trim();
      if (trimmed && isAiShortcutTag(trimmed)) {
        bumpShortcutTagUsage(trimmed);
      }
      goAiAssistant({
        initialMessage: trimmed || (title ? `我想参加 ${title}，帮我组队` : undefined),
        activityLegacyId: Number.isNaN(eventId) ? undefined : eventId,
      });
    },
    [bumpShortcutTagUsage, eventId, title],
  );

  const handleShortcutTag = useCallback(
    (tag: string) => {
      bumpShortcutTagUsage(tag);
      goAiAssistant({ initialMessage: tag, activityLegacyId: eventId });
    },
    [bumpShortcutTagUsage, eventId],
  );

  if (Number.isNaN(eventId) || eventId <= 0) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">{t("eventDetail.notFound")}</div>
        <BottomNav />
      </div>
    );
  }

  if (apiEnabled && activityQuery.isLoading) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">{t("eventDetail.loading")}</div>
        <BottomNav />
      </div>
    );
  }

  if (apiEnabled && activityQuery.isError) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">
          <p>{t("eventDetail.loadError")}</p>
          <button type="button" className="s-event-detail__retry" onClick={() => void activityQuery.refetch()}>
            {t("common.retry")}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!title) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">{t("eventDetail.notFound")}</div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      data-cmp="EventDetail"
      className={["s-event-detail", activityStatusCardClass(activityStatus)].filter(Boolean).join(" ")}
    >
      <main className="s-event-detail__main s-scrollbar-none">
        <header className="s-event-detail__header">
          <button type="button" className="s-event-detail__back" aria-label="返回" onClick={() => goBack(ROUTES.HOME)}>
            <ChevronLeftIcon size={22} />
          </button>
          <div className="s-event-detail__head-main">
            <div className="s-event-detail__title-row">
              <h1>{title}</h1>
              <span className={activityStatusBadgeClass(activityStatus)}>
                {t(activityStatusI18nKey(activityStatus))}
              </span>
            </div>
            {metaLine ? <p className="s-event-detail__meta">{metaLine}</p> : null}
          </div>
          <button type="button" className="s-event-detail__map-btn" aria-label="地图">
            <MapIcon size={18} />
          </button>
        </header>

        <section className="s-event-detail__ai">
          <div className="s-event-detail__ai-head">
            <SparklesIcon size={14} />
            <span>{t("eventDetail.ai.title")}</span>
          </div>
          {shortcutTags.length > 0 ? (
            <div className="s-event-detail__ai-tags">
              {shortcutTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="s-event-detail__ai-tag"
                  onClick={() => handleShortcutTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
          <div className="s-event-detail__ai-input">
            <input
              className="s-event-detail__ai-input__field"
              value={prompt}
              placeholder={t("eventDetail.ai.placeholder")}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && prompt.trim()) openAi(prompt);
              }}
            />
            <button type="button" className="s-event-detail__ai-send" aria-label="发送" onClick={() => openAi(prompt)}>
              <SendIcon size={14} />
            </button>
          </div>
        </section>

        <div className="s-event-detail__posts">
          {postsQuery.isLoading ? (
            <p className="s-event-detail__empty">{t("eventDetail.loading")}</p>
          ) : posts.length === 0 ? (
            <p className="s-event-detail__empty">{t("eventDetail.emptyPosts")}</p>
          ) : (
            posts.map((post) => {
              const isOwn = isCurrentUserPostAuthor(post.name);
              const cardStatus = toEventPostCardStatus(post.status);

              return (
              <article
                key={post.id}
                ref={post.id === highlightPostId ? highlightedPostRef : undefined}
                className={`s-event-post${post.id === highlightPostId ? " s-event-post--highlight" : ""}`}
              >
                <div className="s-event-post__header">
                  <img className="s-event-post__avatar" src={post.avatar} alt="" />
                  <div className="s-event-post__head-main">
                    <div className="s-event-post__top">
                      <p>
                        <strong>{post.name}</strong>
                        <span>
                          {post.location} · {post.time}
                        </span>
                      </p>
                      <span className={eventPostStatusClass(cardStatus)}>
                        {t(eventPostStatusI18nKey(cardStatus))}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="s-event-post__text">{post.body}</p>

                <div className="s-event-post__tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="s-event-post__tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="s-event-post__footer">
                  <div className="s-event-post__actions">
                    <button type="button" className="s-event-post__action" onClick={() => handleLikePost(post.id)}>
                      <HeartIcon size={16} />
                      {post.likes}
                    </button>
                    <button type="button" className="s-event-post__action" onClick={() => handleCommentPost(post.id)}>
                      <MessageCircleIcon size={16} />
                      {post.comments}
                    </button>
                    <button type="button" className="s-event-post__action">
                      <Share2Icon size={16} />
                    </button>
                    {isOwn ? (
                      <button
                        type="button"
                        className="s-event-post__action s-event-post__action--delete"
                        aria-label="删除"
                        onClick={() => handleDeletePost(post)}
                      >
                        <Trash2Icon size={16} />
                      </button>
                    ) : null}
                  </div>
                  {appliedPostIds.has(post.id) ? (
                    <button type="button" className="s-event-post__apply s-event-post__apply--done" disabled>
                      <CheckIcon size={14} />
                      已申请
                    </button>
                  ) : (
                    <button type="button" className="s-event-post__apply" onClick={() => handleApply(post.id)}>
                      <UserPlusIcon size={14} />
                      申请加入
                    </button>
                  )}
                </div>

                {post.comments > 0 ? (
                  <button type="button" className="s-event-post__comments">
                    查看 {post.comments} 条评论
                    <ChevronDownIcon size={14} />
                  </button>
                ) : null}
              </article>
              );
            })
          )}
        </div>

        {posts.length > 0 ? <p className="s-event-detail__end">已经到底啦 ~</p> : null}
      </main>
      <BottomNav />
    </div>
  );
};

export default EventDetailPage;
