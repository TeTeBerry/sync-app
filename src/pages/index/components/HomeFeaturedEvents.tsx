import { Users } from "lucide-react-taro";
import { type FC } from "react";
import { ActivityStatusBadge } from "../../../components/ActivityStatusBadge";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { Button } from "../../../components/ui";
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from "../../../utils/activityStatus";
import type { FeaturedEvent } from "../../../utils/apiMappers";
import { Image, Text, View } from '@tarojs/components';

type HomeFeaturedEventsProps = {
  items: FeaturedEvent[];
  onEventClick: (item: FeaturedEvent) => void;
  onJoinClick: (item: FeaturedEvent) => void;
};

export const HomeFeaturedEvents: FC<HomeFeaturedEventsProps> = ({
  items,
  onEventClick,
  onJoinClick,
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
      {items.map((event, index) => {
        const status = getActivityStatusFromActivity(event.date, event.title);

        return (
          <View
            key={event.id}
            className={["s-home-event", activityStatusCardClass(status)].filter(Boolean).join(" ")}
          >
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              priority={index === 0}
              wrapperClassName="s-home-event__media"
              fallbackWrapperClassName="s-home-event__media s-home-event__media--logo"
              fallback={<Text>{event.logo?.replace(/\n/g, " ")}</Text>}
            />

            <View className="s-home-event__content">
              <Button className="s-home-event__main" onClick={() => onEventClick(event)}>
                <View className="s-home-event__title-row">
                  <Text>{event.title}</Text>
                  <ActivityStatusBadge date={event.date} title={event.title} status={status} />
                </View>
                <Text>
                  <Text style={{fontWeight:"bold"}}>{event.date}</Text>
                  <Text className="s-home-event__at"> at </Text>
                  <Text className="s-home-event__venue">{event.venue}</Text>
                </Text>
                <Text>{event.distance}</Text>
              </Button>

              <View className="s-home-event__footer">
                <View className="s-home-event__meta">
                  <Text className="s-home-event__team" aria-hidden>
                    {event.guests.map((guest, index) => (
                      <Image
                        key={guest}
                        src={guest}
                        decoding="async"
                        style={{ zIndex: event.guests.length - index }}
                      />
                    ))}
                  </Text>
                  <Text className="s-home-event__count">{event.attendeeCount}</Text>
                  <Users size={14} className="s-home-event__count-icon" />
                </View>

                <Button
                  className="s-home-event__join"
                  disabled={status === "ended"}
                  onClick={() => onJoinClick(event)}
                >
                  {status === "ended" ? "已结束" : "加入"}
                </Button>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
