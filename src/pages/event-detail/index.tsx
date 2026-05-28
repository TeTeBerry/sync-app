import "./event-detail.scss";
import Taro, { useRouter } from "@tarojs/taro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Map, Send, Sparkles } from "lucide-react-taro";
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
import { Button, Input, Text, View } from '@tarojs/components';

const EventDetailPage = () => {
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
    cancelText: "取消",
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
        ? formatPostPublishTime(post.createdAt)
        : post.time;
      return { post, publishTimeLabel };
    });
  }, [postsQuery.data]);

  const handleApply = useCallback(
    (postId: string) => {
      if (appliedPostIds.has(postId)) return;

      void applyToPostAndInvalidate(postId)
        .then((result) => {
          setAppliedPostIds((prev) => new Set(prev).add(postId));
          const toastTitle = result.alreadyApplied
            ? "已申请"
            : "申请成功";
          void Taro.showToast({ title: toastTitle, icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: "申请失败", icon: "none" }));
    },
    [appliedPostIds],
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      if (!apiEnabled) return;
      void likePostAndInvalidate(postId).catch(() =>
        void Taro.showToast({ title: "请求失败，请稍后重试", icon: "none" }),
      );
    },
    [apiEnabled],
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
        confirmText: "删除",
      });
      if (!ok) return;
      if (!apiEnabled) {
        void Taro.showToast({ title: "已删除", icon: "success" });
        return;
      }
      void deletePostAndInvalidate(post.id)
        .then(() => {
          void Taro.showToast({ title: "已删除", icon: "success" });
        })
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: "删除失败", icon: "none" });
        });
    },
    [apiEnabled, confirm, postsQuery],
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
      void updatePostAndInvalidate(postId, { status: "completed" })
        .then(() => {
          void Taro.showToast({ title: "已标记为已组队", icon: "success" });
        })
        .catch(() => {
          void Taro.showToast({ title: "标记失败", icon: "none" });
        });
    },
    [apiEnabled, confirm],
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
      <View className="s-event-detail">
        <View className="s-event-detail__fallback">活动不存在</View>
        <BottomNav />
      </View>
    );
  }

  if (activityQuery.isLoading) {
    return (
      <View className="s-event-detail">
        <View className="s-event-detail__fallback">加载中...</View>
        <BottomNav />
      </View>
    );
  }

  if (activityQuery.isError) {
    return (
      <View className="s-event-detail">
        <View className="s-event-detail__fallback">
          <Text>活动信息加载失败</Text>
          <Button
            type="button"
            className="s-event-detail__retry"
            onClick={() => void activityQuery.refetch()}
          >
            重试
          </Button>
        </View>
        <BottomNav />
      </View>
    );
  }

  if (!title) {
    return (
      <View className="s-event-detail">
        <View className="s-event-detail__fallback">活动不存在</View>
        <BottomNav />
      </View>
    );
  }

  const postsLoading = !feedReady || postsQuery.isLoading;

  return (
    <View
      data-cmp="EventDetail"
      className={["s-event-detail", activityStatusCardClass(activityStatus)].filter(Boolean).join(" ")}
    >
      <View ref={scrollRef} className="s-event-detail__main s-scrollbar-none">
        <View className="s-event-detail__header">
          <Button
            type="button"
            className="s-event-detail__back"
            aria-label="返回"
            onClick={() => go(ROUTES.HOME)}
          >
            <ChevronLeft size={22} />
          </Button>
          <View className="s-event-detail__head-main">
            <View className="s-event-detail__title-row">
              <Text>{title}</Text>
            </View>
            {metaLine ? <Text className="s-event-detail__meta">{metaLine}</Text> : null}
          </View>
          <Button type="button" className="s-event-detail__map-btn" aria-label="地图">
            <Map size={18} />
          </Button>
        </View>

        <View className="s-event-detail__ai">
          <View className="s-event-detail__ai-head">
            <Sparkles size={14} />
            <Text>告诉我你的需求 ai精准匹配</Text>
          </View>
          {shortcutTags.length > 0 ? (
            <View className="s-event-detail__ai-tags">
              {shortcutTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  className="s-event-detail__ai-tag"
                  onClick={() => handleShortcutTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </View>
          ) : null}
          <View className="s-event-detail__ai-input">
            <Input
              className="s-event-detail__ai-input__field"
              value={prompt}
              placeholder="告诉我你的需求..."
              onInput={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && prompt.trim()) openAi(prompt);
              }}
            />
            <Button
              type="button"
              className="s-event-detail__ai-send"
              aria-label="发送"
              onClick={() => openAi(prompt)}
            >
              <Send size={14} />
            </Button>
          </View>
        </View>

        <View className="s-event-detail__posts">
          {postsLoading ? (
            <Text className="s-event-detail__empty">加载中...</Text>
          ) : postItems.length === 0 ? (
            <Text className="s-event-detail__empty">暂无组队帖，来发布第一条吧</Text>
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
        </View>

        {postItems.length > 0 && !postsLoading ? (
          <Text className="s-event-detail__end">已经到底啦 ~</Text>
        ) : null}
      </View>
      {confirmDialog}
      <BottomNav />
    </View>
  );
};

export default EventDetailPage;
