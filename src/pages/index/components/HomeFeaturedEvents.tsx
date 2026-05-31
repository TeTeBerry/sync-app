import { Users } from "lucide-react-taro";
import { type FC } from "react";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { Button } from "../../../components/ui";
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
  type ActivityStatus,
} from "../../../utils/activityStatus";
import {
  resolveFeaturedEventLegacyId,
  type FeaturedEvent,
} from "../../../utils/apiMappers";
import { thumbnailImageUrl } from "../../../utils/imageUrl";
import { useRouteTransitionActive } from "../../../utils/route";
import { Image, Text, View } from "@tarojs/components";

function featuredEventStatusTag(event: FeaturedEvent, status: ActivityStatus): string | null {
  if (status === "ended") return "已结束";
  if (event.isHot) return "热门";
  const location = event.venue?.trim();
  if (!location) return null;
  return location;
}

function featuredEventTagClassName(tag: string): string {
  const classes = ["s-home-event__tag"];
  if (tag !== "已结束" && tag !== "热门") {
    classes.push("s-home-event__tag--location");
  }
  return classes.join(" ");
}

type HomeFeaturedEventsProps = {
  items: FeaturedEvent[];
  onEventClick: (item: FeaturedEvent) => void;
  onJoinClick: (item: FeaturedEvent) => void;
  onEventPreload?: (item: FeaturedEvent) => void;
};

export const HomeFeaturedEvents: FC<HomeFeaturedEventsProps> = ({
  items,
  onEventClick,
  onJoinClick,
  onEventPreload,
}) => {
  if (items.length === 0) {
    return (
      <View className="s-home-featured" aria-label="Featured events">
        <Text className="s-home-featured__empty">暂无进行中的活动</Text>
      </View>
    );
  }

  return (
    <View className="s-home-featured" aria-label="Featured events">
      {items.map((event, index) => (
        <HomeFeaturedEventRow
          key={event.id}
          event={event}
          index={index}
          onEventClick={onEventClick}
          onJoinClick={onJoinClick}
          onEventPreload={onEventPreload}
        />
      ))}
    </View>
  );
};

function HomeFeaturedEventRow({
  event,
  index,
  onEventClick,
  onJoinClick,
  onEventPreload,
}: {
  event: FeaturedEvent;
  index: number;
  onEventClick: (item: FeaturedEvent) => void;
  onJoinClick: (item: FeaturedEvent) => void;
  onEventPreload?: (item: FeaturedEvent) => void;
}) {
  const status = getActivityStatusFromActivity(event.date, event.title);
  const statusTag = featuredEventStatusTag(event, status);
  const venue = event.venue?.trim() ?? "";
  const tagIsLocation = Boolean(statusTag && statusTag === venue);
  const showVenueInline = Boolean(venue) && !tagIsLocation;
  const legacyId = resolveFeaturedEventLegacyId(event);
  const isJoinNavigating = useRouteTransitionActive(legacyId ?? undefined);
  const thumbSrc = thumbnailImageUrl(event.image, 200);

  const handlePreload = () => {
    if (legacyId == null) return;
    onEventPreload?.(event);
  };

  return (
    <View
      className={["s-home-event", activityStatusCardClass(status)].filter(Boolean).join(" ")}
      onTouchStart={handlePreload}>
      <ImageWithFallback
        src={thumbSrc}
        alt={event.title}
        priority={index === 0}
        wrapperClassName="s-home-event__media"
        imageClassName="s-home-event__media-img"
        fallbackWrapperClassName="s-home-event__media s-home-event__media--logo"
        fallback={<Text>{event.logo?.replace(/\n/g, " ")}</Text>}
      />

      <View className="s-home-event__content">
        <Button
          className="s-home-event__main"
          onTouchStart={handlePreload}
          onClick={() => onEventClick(event)}>
          <View className="s-home-event__info">
            <Text className="s-home-event__title">{event.title}</Text>
            <View className="s-home-event__date-row">
              <Text className="s-home-event__date">{event.date}</Text>
              {showVenueInline ? (
                <>
                  <Text className="s-home-event__at">at</Text>
                  <Text className="s-home-event__venue">{venue}</Text>
                </>
              ) : null}
            </View>
            {statusTag ? (
              <Text className={featuredEventTagClassName(statusTag)}>{statusTag}</Text>
            ) : null}
          </View>
        </Button>

        <View className="s-home-event__footer">
          <View className="s-home-event__meta">
            <View className="s-home-event__team" aria-hidden>
              {(event.guests ?? []).map((guest, guestIndex) => (
                <Image
                  key={guest}
                  src={thumbnailImageUrl(guest, 48) ?? guest}
                  className="s-home-event__team-avatar"
                  mode="aspectFill"
                  lazyLoad
                  style={{ zIndex: event.guests.length - guestIndex }}
                />
              ))}
            </View>
            <Text className="s-home-event__count">{event.attendeeCount}</Text>
            <Users size={14} color="#ffffff" className="s-home-event__count-icon" />
          </View>

          <Button
            className={[
              "s-home-event__join",
              isJoinNavigating ? "s-home-event__join--loading" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={status === "ended" || isJoinNavigating || legacyId == null}
            onTouchStart={handlePreload}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onJoinClick(event);
            }}>
            <Text className="s-home-event__join-text">
              {isJoinNavigating ? "加入中…" : status === "ended" ? "已结束" : "加入"}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
