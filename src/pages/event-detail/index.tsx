import "./event-detail.scss";
import Taro, { useRouter } from "@tarojs/taro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, MapIcon, SendIcon, SparklesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { go, goAiAssistant, ROUTES } from "../../utils/route";
import BottomNav from "../../components/BottomNav";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useDeferredMount } from "../../hooks/useDeferredMount";
import { useNavigationStore } from "../../stores/navigationStore";
import {
  applyToPostAndInvalidate,
  deletePostAndInvalidate,
  likePostAndInvalidate,
  updatePostAndInvalidate,
  useActivityDetailQuery,
  useCurrentUserQuery,
  useEventPostsQuery,
} from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import type { EventDetailPost } from "../../types/backend";
import {
  getTopAiShortcutTags,
  isAiShortcutTag,
  recordAiShortcutTagUse,
} from "../../utils/aiShortcutTags";
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from "../../utils/activityStatus";
import { formatPostPublishTime } from "../../utils/formatPostPublishTime";
import { EventPostsVirtualList } from "./components/EventPostsVirtualList";

const EventDetailPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const scrollRef = useRef<HTMLElement | null>(null);
  const activeActivityLegacyId = useNavigationStore((state) => state.activeActivityLegacyId);
  const feedReady = useDeferredMount(80);

  const eventId = useMemo(() => {
    const fromParams = Number(router.params.id);
    if (Number.isFinite(fromParams) && fromParams > 0) {
      return fromParams;
    }
    if (activeActivityLegacyId != null && activeActivityLegacyId > 0) {
      return activeActivityLegacyId;
    }
    return NaN;
  }, [activeActivityLegacyId, router.params.id]);
  const highlightPostId = router.params.postId?.trim() || "";

  useEffect(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      useNavigationStore.getState().setActiveActivityLegacyId(eventId);
    }
  }, [eventId]);

  const activityQuery = useActivityDetailQuery(eventId);
  const postsQuery = useEventPostsQuery(eventId, { enabled: feedReady });
  const currentUserQuery = useCurrentUserQuery();
  const apiEnabled = isApiEnabled();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t("common.cancel"),
  });
  const [prompt, setPrompt] = useState("");
  const [shortcutTags, setShortcutTags] = useState(() => getTopAiShortcutTags());
  const [appliedPostIds, setAppliedPostIds] = useState<Set<string>>(() => new Set());
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );

  const title = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityStatus = getActivityStatusFromActivity(activityDate, title);
  const metaLine = useMemo(() => {
    if (!activityQuery.data) return "";
    const parts = [activityQuery.data.date, activityQuery.data.location].filter(Boolean);
    return parts.join(" · ");
  }, [activityQuery.data]);

  const postItems = useMemo(() => {
    return (postsQuery.data ?? []).map((item) => {
      const post: EventDetailPost = {
        id: item.id,
        userId: item.userId,
        name: item.name,
        location: item.location,
        time: item.time,
        createdAt: item.createdAt,
        body: item.body,
        tags: item.tags,
        likes: item.likes,
        liked: item.liked,
        comments: item.comments,
        avatar: item.avatar,
        status: item.status,
        contentTypes: item.contentTypes,
        images: item.images,
      };
      const publishTimeLabel = post.createdAt
        ? formatPostPublishTime(post.createdAt, t, i18n.language)
        : post.time;
      return { post, publishTimeLabel };
    });
  }, [postsQuery.data, i18n.language, t]);

  const handleApply = useCallback(
    (postId: string) => {
      if (appliedPostIds.has(postId)) return;

      void applyToPostAndInvalidate(queryClient, postId)
        .then((result) => {
          setAppliedPostIds((prev) => new Set(prev).add(postId));
          const toastTitle = result.alreadyApplied
            ? t("eventDetail.apply.alreadyApplied")
            : t("eventDetail.apply.success");
          void Taro.showToast({ title: toastTitle, icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: t("eventDetail.apply.failed"), icon: "none" }));
    },
    [appliedPostIds, queryClient, t],
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      if (!apiEnabled) return;
      void likePostAndInvalidate(queryClient, postId).catch(() =>
        void Taro.showToast({ title: t("common.requestFailed"), icon: "none" }),
      );
    },
    [apiEnabled, queryClient, t],
  );

  const togglePostComments = useCallback((postId: string) => {
    setExpandedCommentPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  const handleDeletePost = useCallback(
    async (post: EventDetailPost) => {
      const ok = await confirm({
        title: "确认删除",
        message: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: t("profile.myPosts.delete"),
      });
      if (!ok) return;
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
    [apiEnabled, confirm, postsQuery, queryClient, t],
  );

  const handleCommentSubmitted = useCallback(() => {
    void postsQuery.refetch();
  }, [postsQuery]);

  const handleCompletePost = useCallback(
    async (postId: string) => {
      const ok = await confirm({
        title: "确认标记为已组队",
        message: "标记后该帖子将结束招募，同类型帖子可重新发布。确定要继续吗？",
        confirmText: "确认",
      });
      if (!ok) return;
      if (!apiEnabled) {
        void Taro.showToast({ title: "已标记为已组队", icon: "success" });
        return;
      }
      void updatePostAndInvalidate(queryClient, postId, { status: "completed" })
        .then(() => {
          void Taro.showToast({ title: "已标记为已组队", icon: "success" });
        })
        .catch(() => {
          void Taro.showToast({ title: "标记失败", icon: "none" });
        });
    },
    [apiEnabled, confirm, queryClient],
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
      setPrompt("");
      goAiAssistant({
        ...(trimmed ? { initialMessage: trimmed } : {}),
        activityLegacyId: Number.isNaN(eventId) ? undefined : eventId,
      });
    },
    [bumpShortcutTagUsage, eventId],
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

  if (activityQuery.isLoading) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">{t("eventDetail.loading")}</div>
        <BottomNav />
      </div>
    );
  }

  if (activityQuery.isError) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">
          <p>{t("eventDetail.loadError")}</p>
          <button
            type="button"
            className="s-event-detail__retry"
            onClick={() => void activityQuery.refetch()}
          >
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

  const postsLoading = !feedReady || postsQuery.isLoading;

  return (
    <div
      data-cmp="EventDetail"
      className={["s-event-detail", activityStatusCardClass(activityStatus)].filter(Boolean).join(" ")}
    >
      <main ref={scrollRef} className="s-event-detail__main s-scrollbar-none">
        <header className="s-event-detail__header">
          <button
            type="button"
            className="s-event-detail__back"
            aria-label="返回"
            onClick={() => go(ROUTES.HOME)}
          >
            <ChevronLeftIcon size={22} />
          </button>
          <div className="s-event-detail__head-main">
            <div className="s-event-detail__title-row">
              <h1>{title}</h1>
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
            <button
              type="button"
              className="s-event-detail__ai-send"
              aria-label="发送"
              onClick={() => openAi(prompt)}
            >
              <SendIcon size={14} />
            </button>
          </div>
        </section>

        <div className="s-event-detail__posts">
          {postsLoading ? (
            <p className="s-event-detail__empty">{t("eventDetail.loading")}</p>
          ) : postItems.length === 0 ? (
            <p className="s-event-detail__empty">{t("eventDetail.emptyPosts")}</p>
          ) : (
            <EventPostsVirtualList
              scrollRef={scrollRef}
              items={postItems}
              highlightPostId={highlightPostId}
              expandedCommentPostIds={expandedCommentPostIds}
              appliedPostIds={appliedPostIds}
              apiEnabled={apiEnabled}
              currentUserAvatar={currentUserQuery.data?.avatar}
              onLike={handleLikePost}
              onToggleComments={togglePostComments}
              onDelete={handleDeletePost}
              onApply={handleApply}
              onComplete={handleCompletePost}
              onCommentSubmitted={handleCommentSubmitted}
            />
          )}
        </div>

        {postItems.length > 0 && !postsLoading ? (
          <p className="s-event-detail__end">已经到底啦 ~</p>
        ) : null}
      </main>
      {confirmDialog}
      <BottomNav />
    </div>
  );
};

export default EventDetailPage;
