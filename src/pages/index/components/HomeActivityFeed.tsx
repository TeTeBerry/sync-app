import { ChevronRightIcon } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui";
import { FeedPostList } from "../../../components/FeedPostList";
import type { ActivityPost } from "../homeData";

type HomeActivityFeedProps = {
  items: ActivityPost[];
  onSeeAll: () => void;
  onDelete?: (post: ActivityPost) => void;
  onLike?: (post: ActivityPost) => void;
  onCommentSubmitted?: () => void;
};

export const HomeActivityFeed: FC<HomeActivityFeedProps> = ({
  items,
  onSeeAll,
  onDelete,
  onLike,
  onCommentSubmitted,
}) => {
  const { t } = useTranslation();

  return (
    <section className="s-home-feed">
      <div className="s-home-feed__head">
        <h2>{t("home.feed.title")}</h2>
        <Button className="s-home-feed__link" onClick={onSeeAll}>
          {t("home.feed.seeAll")}
          <ChevronRightIcon size={16} />
        </Button>
      </div>

      <FeedPostList
        items={items}
        onDelete={onDelete}
        onLike={onLike}
        onCommentSubmitted={onCommentSubmitted}
      />
    </section>
  );
};
