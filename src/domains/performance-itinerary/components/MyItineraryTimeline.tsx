import React from 'react';
import { Star } from '@/components/icons';
import { Button } from '@/components/ui';
import { Text, View } from '@tarojs/components';
import type {
  ItineraryDay,
  ItineraryTimelineDotColor,
  ItineraryTimelineItem,
} from '../types/myItineraryUi';

function TimelineCard({ item }: { item: ItineraryTimelineItem }) {
  return (
    <View
      className={[
        's-my-itinerary__card',
        item.highlighted ? 's-my-itinerary__card--highlight' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Text className="s-my-itinerary__card-title">{item.title}</Text>
      {item.subtitle ? (
        <Text className="s-my-itinerary__card-sub">{item.subtitle}</Text>
      ) : null}
      {item.timeTag || item.pill ? (
        <View className="s-my-itinerary__card-tags">
          {item.timeTag ? (
            <Text
              className={[
                's-my-itinerary__time-tag',
                item.timeTagColor
                  ? `s-my-itinerary__time-tag--${item.timeTagColor}`
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.timeTag}
            </Text>
          ) : null}
          {item.pill ? (
            <View
              className={[
                's-my-itinerary__pill',
                `s-my-itinerary__pill--${item.pill.variant}`,
              ].join(' ')}
            >
              {item.pill.variant === 'pink' ? (
                <Star size={11} color="var(--primary)" aria-hidden />
              ) : null}
              <Text>{item.pill.label}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export type MyItineraryTimelineProps = {
  itineraryDays: ItineraryDay[];
  activeDayId: string;
  onActiveDayChange: (dayId: string) => void;
};

const MyItineraryTimeline: React.FC<MyItineraryTimelineProps> = ({
  itineraryDays,
  activeDayId,
  onActiveDayChange,
}) => {
  const activeDay =
    itineraryDays.find((day) => day.id === activeDayId) ?? itineraryDays[0];

  return (
    <>
      <View className="s-my-itinerary__date-tabs">
        {itineraryDays.map((day) => {
          const active = day.id === activeDayId;
          return (
            <Button
              key={day.id}
              className={[
                's-my-itinerary__date-tab',
                active ? 's-my-itinerary__date-tab--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              hoverClass="s-my-itinerary__date-tab--pressed"
              onTap={() => onActiveDayChange(day.id)}
            >
              {day.label}
            </Button>
          );
        })}
      </View>

      <View className="s-my-itinerary__timeline">
        <View className="s-my-itinerary__timeline-rail" aria-hidden />
        {activeDay?.items.map((item) => (
          <View key={item.id} className="s-my-itinerary__timeline-item">
            <Text
              className={[
                's-my-itinerary__timeline-time',
                `s-my-itinerary__timeline-time--${item.dotColor}`,
              ].join(' ')}
            >
              {item.time}
            </Text>
            <View
              className={[
                's-my-itinerary__timeline-dot',
                `s-my-itinerary__timeline-dot--${item.dotColor as ItineraryTimelineDotColor}`,
              ].join(' ')}
              aria-hidden
            />
            <TimelineCard item={item} />
          </View>
        ))}
      </View>
    </>
  );
};

export default MyItineraryTimeline;
