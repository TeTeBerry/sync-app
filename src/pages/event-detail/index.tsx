import "./event-detail.scss";
import Taro from "@tarojs/taro";
import { useCallback, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  HeartIcon,
  MapIcon,
  MessageCircleIcon,
  SendIcon,
  Share2Icon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import { goAiAssistant, goBack, ROUTES } from "../../utils/route";
import { getEventDetail, type EventTeamPost } from "./eventDetailData";

const aiTags = ["组队队友", "拼房搭子", "拼车同行", "拼套票"];

const statusClass = (status: EventTeamPost["status"]) =>
  status === "已成团" ? "s-event-post__status s-event-post__status--done" : "s-event-post__status";

const EventDetailPage = () => {
  const eventId = Number(Taro.getCurrentInstance().router?.params?.id);
  const detail = useMemo(() => getEventDetail(eventId), [eventId]);
  const [prompt, setPrompt] = useState("");

  const openAi = useCallback(
    (message?: string) => {
      goAiAssistant({
        initialMessage: message?.trim() || (detail ? `我想参加 ${detail.title}，帮我找搭子` : undefined),
      });
    },
    [detail],
  );

  if (!detail) {
    return (
      <div className="s-event-detail">
        <div className="s-event-detail__fallback">活动不存在</div>
      </div>
    );
  }

  return (
    <div data-cmp="EventDetail" className="s-event-detail">
      <main className="s-event-detail__main s-scrollbar-none">
        <header className="s-event-detail__header">
          <button type="button" className="s-event-detail__back" aria-label="返回" onClick={() => goBack(ROUTES.HOME)}>
            <ChevronLeftIcon size={20} />
          </button>
          <div className="s-event-detail__head-main">
            <h1>{detail.title}</h1>
            <p>{detail.posts.length} 条组队帖</p>
          </div>
          <button type="button" className="s-event-detail__map-btn" aria-label="地图">
            <MapIcon size={18} />
          </button>
        </header>

        <section className="s-event-detail__ai">
          <div className="s-event-detail__ai-head">
            <SparklesIcon size={14} />
            <span>告诉我你要D什么，精准匹配</span>
          </div>
          <p className="s-event-detail__ai-bubble">👋 你想找什么类型的搭子？</p>
          <div className="s-event-detail__ai-tags">
            {aiTags.map((tag) => (
              <button key={tag} type="button" className="s-event-detail__ai-tag" onClick={() => openAi(tag)}>
                {tag}
              </button>
            ))}
          </div>
          <div className="s-event-detail__ai-input">
            <input
              value={prompt}
              placeholder="告诉我你的需求..."
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
          {detail.posts.length === 0 ? (
            <p className="s-event-detail__empty">暂无组队帖，来发布第一条吧</p>
          ) : (
            detail.posts.map((post) => (
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
                      <span className={statusClass(post.status)}>{post.status}</span>
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
                  </div>
                  <button type="button" className="s-event-post__apply">
                    <UserPlusIcon size={14} />
                    申请加入
                  </button>
                </div>

                {post.comments > 0 ? (
                  <button type="button" className="s-event-post__comments">
                    查看 {post.comments} 条评论
                    <ChevronDownIcon size={14} />
                  </button>
                ) : null}
              </article>
            ))
          )}
        </div>

        {detail.posts.length > 0 ? <p className="s-event-detail__end">已经到底啦 ~</p> : null}
      </main>
    </div>
  );
};

export default EventDetailPage;
