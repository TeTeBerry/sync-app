import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { EventsActivityCalendar } from './EventsActivityCalendar';
import { EventsActivityList } from './EventsActivityList';
import type { EventCardUi } from '@/utils/apiMappers';

type EventsCalendarTabContentProps = {
  calendarCatalogEvents: EventCardUi[];
  year: number;
  month: number;
  selectedDay: { year: number; month: number; day: number } | null;
  calendarListEvents: EventCardUi[];
  calendarSectionTitle: string;
  calendarEmptyText: string;
  isError: boolean;
  onRetry: () => void;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay: (year: number, month: number, day: number) => void;
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
  onConfirmUnfollow: (title: string) => Promise<boolean>;
};

export const EventsCalendarTabContent: FC<EventsCalendarTabContentProps> = ({
  calendarCatalogEvents,
  year,
  month,
  selectedDay,
  calendarListEvents,
  calendarSectionTitle,
  calendarEmptyText,
  isError,
  onRetry,
  onMonthChange,
  onSelectDay,
  onOpenDetail,
  onWarmDetail,
  onConfirmUnfollow,
}) => {
  return (
    <>
      <EventsActivityCalendar
        activities={calendarCatalogEvents}
        year={year}
        month={month}
        selected={selectedDay}
        onMonthChange={onMonthChange}
        onSelectDay={onSelectDay}
      />

      <View className="s-events__section-head">
        <View className="s-events__section-title">
          <Text>{calendarSectionTitle}</Text>
        </View>
      </View>

      <EventsActivityList
        events={calendarListEvents}
        isError={isError}
        emptyText={calendarEmptyText}
        onRetry={onRetry}
        onOpenDetail={onOpenDetail}
        onWarmDetail={onWarmDetail}
        onConfirmUnfollow={onConfirmUnfollow}
      />
    </>
  );
};
