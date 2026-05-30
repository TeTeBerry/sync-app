import { Check, MessageCircle, ThumbsUp } from "lucide-react-taro";
import { Button, Text, View } from "@tarojs/components";
import { ImageWithFallback } from "../../../../components/ImageWithFallback";
import { getLiveInfoCategory } from "../liveInfoConfig";
import type { LiveInfoFeedItem } from "../liveInfoMock";
import { EventLiveInfoStarRow } from "./EventLiveInfoStarRow";

type EventLiveInfoFeedItemProps = {
  item: LiveInfoFeedItem;
  onToggleLike: (id: string) => void;
};

function formatUpdateMeta(timeLabel: string | undefined, ratingCount: number): string {
  const time = timeLabel?.trim() || "刚刚";
  const n = Math.max(0, ratingCount);
  return `${time} · ${n} 项更新`;
}

function metricGridClass(total: number, index: number): string {
  if (total === 3 && index === 2) return "s-live-info-post__metric--full";
  return "";
}

export function EventLiveInfoFeedItem({ item, onToggleLike }: EventLiveInfoFeedItemProps) {
  const ratings = Array.isArray(item.ratings) ? item.ratings : [];
  const id = item.id?.trim() || "";
  const userName = item.userName?.trim() || "用户";
  const likes = typeof item.likes === "number" && item.likes >= 0 ? item.likes : 0;
  const certified = Boolean(item.certified);
  const remark = item.remark?.trim();

  return (
    <View className="s-live-info-post">
      <View className="s-live-info-post__header">
        <View className="s-live-info-post__avatar-wrap">
          <ImageWithFallback
            src={item.avatar}
            alt={userName}
            imageClassName="s-live-info-post__avatar"
            placeholderClassName="s-live-info-post__avatar s-live-info-post__avatar--placeholder"
            fallback={userName.slice(0, 1)}
          />
          {certified ? (
            <View className="s-live-info-post__avatar-badge" aria-hidden>
              <Check size={10} color="#fff" strokeWidth={3} />
            </View>
          ) : null}
        </View>

        <View className="s-live-info-post__identity">
          <View className="s-live-info-post__name-row">
            <Text className="s-live-info-post__name">{userName}</Text>
            {certified ? (
              <Text className="s-live-info-post__cert-pill">手环认证</Text>
            ) : null}
          </View>
          <Text className="s-live-info-post__meta">
            {formatUpdateMeta(item.timeLabel, ratings.length)}
          </Text>
        </View>

        <Button
          className={[
            "s-live-info-post__like-pill",
            item.liked && "s-live-info-post__like-pill--on",
          ]
            .filter(Boolean)
            .join(" ")}
          hoverClass="s-live-info-post__like-pill--pressed"
          disabled={!id}
          onClick={() => id && onToggleLike(id)}>
          <ThumbsUp
            size={14}
            color={item.liked ? "var(--primary)" : "#8e8e93"}
            aria-hidden
          />
          <Text className="s-live-info-post__like-count">{likes}</Text>
        </Button>
      </View>

      {ratings.length > 0 ? (
        <View
          className={[
            "s-live-info-post__grid",
            ratings.length === 1 && "s-live-info-post__grid--single",
            ratings.length === 3 && "s-live-info-post__grid--triple",
          ]
            .filter(Boolean)
            .join(" ")}>
          {ratings.map((rating, index) => {
            const category = getLiveInfoCategory(rating.categoryId);
            const Icon = category.icon;
            const score =
              typeof rating.score === "number" && Number.isFinite(rating.score)
                ? Math.min(5, Math.max(0, rating.score))
                : 0;
            const pct = (score / 5) * 100;
            const statusLabel = category.scoreLabel(score);

            return (
              <View
                key={`${rating.categoryId}-${index}`}
                className={[
                  "s-live-info-post__metric",
                  `s-live-info-post__metric--${rating.categoryId}`,
                  metricGridClass(ratings.length, index),
                ]
                  .filter(Boolean)
                  .join(" ")}>
                <View className="s-live-info-post__metric-head">
                  <View className="s-live-info-post__metric-label-wrap">
                    <Icon size={14} color={category.color} aria-hidden />
                    <Text className="s-live-info-post__metric-label">{category.label}</Text>
                  </View>
                  <Text
                    className="s-live-info-post__metric-tag"
                    style={{
                      color: category.color,
                      backgroundColor: `${category.color}24`,
                    }}>
                    {statusLabel}
                  </Text>
                </View>
                <View className="s-live-info-post__metric-bar">
                  <View
                    className="s-live-info-post__metric-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${category.color}55, ${category.color})`,
                    }}
                  />
                </View>
                <View className="s-live-info-post__metric-foot">
                  <EventLiveInfoStarRow category={category} score={score} />
                  <Text
                    className="s-live-info-post__metric-score"
                    style={{ color: category.color }}>
                    {score.toFixed(1)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {remark ? (
        <View className="s-live-info-post__comment">
          <MessageCircle size={14} color="#8e8e93" aria-hidden />
          <Text className="s-live-info-post__comment-text">{remark}</Text>
        </View>
      ) : null}
    </View>
  );
}
