import "./event-detail.scss";
import Taro from "@tarojs/taro";
import { useCallback, useMemo, useState } from "react";
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
import { deletePostAndInvalidate, useEventPostsQuery } from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { isCurrentUserPostAuthor } from "../../utils/postOwnership";
import { getEventDetail, type EventTeamPost } from "./eventDetailData";
import {
  getTopAiShortcutTags,
  isAiShortcutTag,
  recordAiShortcutTagUse,
} from "../../utils/aiShortcutTags";

const EventDetailPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const eventId = Number(Taro.getCurrentInstance().router?.params?.id);
  const detail = useMemo(() => getEventDetail(eventId), [eventId]);
  const postsQuery = useEventPostsQuery(eventId);
  const [prompt, setPrompt] = useState("");
  const [shortcutTags, setShortcutTags] = useState(() => getTopAiShortcutTags());
  const [appliedPostIds, setAppliedPostIds] = useState<Set<string>>(() => new Set());

  const posts: EventTeamPost[] = useMemo(() => {
    if (isApiEnabled() && postsQuery.data) {
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
    return detail?.posts ?? [];
  }, [detail?.posts, postsQuery.data]);

  const handleApply = useCallback((postId: string) => {
    setAppliedPostIds((prev) => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  }, []);

  const handleDeletePost = useCallback(
    (post: EventTeamPost) => {
      void Taro.showModal({
        title: "确认删除",
        content: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (!res.confirm) return;
          if (!isApiEnabled()) {
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
    [postsQuery, queryClient],
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
        initialMessage: trimmed || (detail ? `我想参加 ${detail.title}，帮我结伴` : undefined),
      });
    },
    [bumpShortcutTagUsage, detail],
  );

  const handleShortcutTag = useCallback(
    (tag: string) => {
      bumpShortcutTagUsage(tag);
      goAiAssistant({ initialMessage: tag });
    },
    [bumpShortcutTagUsage],
  );

  if (!detail) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">活动不存在</div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div data-cmp="EventDetail" className="s-event-detail">
      <main className="s-event-detail__main s-scrollbar-none">
        <header className="s-event-detail__header">
          <button type="button" className="s-event-detail__back" aria-label="返回" onClick={() => goBack(ROUTES.HOME)}>
            <ChevronLeftIcon size={22} />
          </button>
          <div className="s-event-detail__head-main">
            <h1>{detail.title}</h1>
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
            <p className="s-event-detail__empty">加载中...</p>
          ) : posts.length === 0 ? (
            <p className="s-event-detail__empty">暂无组队帖，来发布第一条吧</p>
          ) : (
            posts.map((post) => {
              const isOwn = isCurrentUserPostAuthor(post.name);

              return (
              <article key={post.id} className="s-event-post">
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
                    <button type="button" className="s-event-post__action">
                      <HeartIcon size={16} />
                      {post.likes}
                    </button>
                    <button type="button" className="s-event-post__action">
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
