import { ChevronRightIcon, MapPinIcon, MessageCircleIcon, Share2Icon, ThumbsUpIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../../components/ui";
import type { ActivityPost } from "../homeMarketData";

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
        See All
        <ChevronRightIcon size={16} />
      </Button>
    </div>

    <div className="s-home-feed__list">
      {items.map((post) => (
        <article key={post.id} className="s-home-post">
          <img className="s-home-post__avatar" src={post.avatar} alt="" />
          <div className="s-home-post__body">
            <div className="s-home-post__top">
              <p>
                <strong>{post.name}</strong>
                <span>{post.handle} to</span>
              </p>
              <span className={statusClass(post.status)}>{post.status}</span>
            </div>
            <h3>{post.event}</h3>
            <small className="s-home-post__location">
              <MapPinIcon size={14} />
              {post.location}
            </small>
            <p className="s-home-post__text">{post.body}</p>
            <div className="s-home-post__actions">
              <span>{post.time}</span>
              <Button className="s-home-post__action">
                <ThumbsUpIcon size={16} />
                {post.likes}
              </Button>
              <Button className="s-home-post__action">
                <MessageCircleIcon size={16} />
                Comment
              </Button>
              <Button className="s-home-post__action">
                <Share2Icon size={16} />
                Share
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);
