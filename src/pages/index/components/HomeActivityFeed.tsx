import { ChevronRightIcon, MapPinIcon, MessageCircleIcon, Share2Icon, ThumbsUpIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../../components/ui";
import type { ActivityPost } from "../homeData";

type HomeActivityFeedProps = {
  items: ActivityPost[];
  onSeeAll: () => void;
};

const statusClass = (status: ActivityPost["status"]) =>
  status === "已成团" ? "s-home-post__status s-home-post__status--done" : "s-home-post__status";

export const HomeActivityFeed: FC<HomeActivityFeedProps> = ({ items, onSeeAll }) => (
  <section className="s-home-feed">
    <div className="s-home-feed__head">
      <h2>更多热门活动</h2>
      <Button className="s-home-feed__link" onClick={onSeeAll}>
        查看全部
        <ChevronRightIcon size={16} />
      </Button>
    </div>

    <div className="s-home-feed__list">
      {items.map((post) => (
        <article key={post.id} className="s-home-post">
          <div className="s-home-post__header">
            <img className="s-home-post__avatar" src={post.avatar} alt="" />
            <div className="s-home-post__head-main">
              <div className="s-home-post__top">
                <p>
                  <strong>{post.name}</strong>
                  <span>{post.handle}</span>
                </p>
                <span className={statusClass(post.status)}>{post.status}</span>
              </div>
              <h3>{post.event}</h3>
              <small className="s-home-post__location">
                <MapPinIcon size={13} />
                {post.location}
              </small>
            </div>
          </div>

          <p className="s-home-post__text">{post.body}</p>

          <div className="s-home-post__footer">
            <span className="s-home-post__time">{post.time}</span>
            <div className="s-home-post__actions">
              <Button className="s-home-post__action">
                <ThumbsUpIcon size={16} />
                {post.likes}
              </Button>
              <Button className="s-home-post__action">
                <MessageCircleIcon size={16} />
                评论
              </Button>
              <Button className="s-home-post__action">
                <Share2Icon size={16} />
                分享
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);
