import { useMemo, type FC } from 'react';
import { ChevronLeft, ChevronRight } from '../../../components/icons';
import {
  buildActivityDaySet,
  buildMonthGrid,
  CALENDAR_WEEKDAY_LABELS,
  formatCalendarMonthLabel,
  isSameCalendarDay,
  shiftCalendarMonth,
  todayCalendarParts,
  type ActivityCalendarFields,
} from '../../../utils/activityCalendar';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';

type EventsActivityCalendarProps = {
  activities: ActivityCalendarFields[];
  year: number;
  month: number;
  selected: { year: number; month: number; day: number } | null;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay: (year: number, month: number, day: number) => void;
};

export const EventsActivityCalendar: FC<EventsActivityCalendarProps> = ({
  activities,
  year,
  month,
  selected,
  onMonthChange,
  onSelectDay,
}) => {
  const t = useT();
  const activityDays = useMemo(() => buildActivityDaySet(activities), [activities]);
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const today = todayCalendarParts();

  return (
    <View className="s-events-calendar">
      <View className="s-events-calendar__head">
        <View
          className="s-events-calendar__nav-btn"
          role="button"
          aria-label={t('events.calendarPrevMonth')}
          onClick={() => {
            const next = shiftCalendarMonth(year, month, -1);
            onMonthChange(next.year, next.month);
          }}
        >
          <ChevronLeft size={18} color="#8e8e93" />
        </View>
        <Text className="s-events-calendar__month">
          {formatCalendarMonthLabel(year, month)}
        </Text>
        <View
          className="s-events-calendar__nav-btn"
          role="button"
          aria-label={t('events.calendarNextMonth')}
          onClick={() => {
            const next = shiftCalendarMonth(year, month, 1);
            onMonthChange(next.year, next.month);
          }}
        >
          <ChevronRight size={18} color="#8e8e93" />
        </View>
      </View>

      <View className="s-events-calendar__weekdays">
        {CALENDAR_WEEKDAY_LABELS.map((label) => (
          <Text key={label} className="s-events-calendar__weekday">
            {label}
          </Text>
        ))}
      </View>

      <View className="s-events-calendar__grid">
        {cells.map((cell) => {
          if (cell.kind === 'empty') {
            return (
              <View
                key={cell.key}
                className="s-events-calendar__cell s-events-calendar__cell--empty"
              />
            );
          }

          const key = cell.key;
          const hasActivity = activityDays.has(key);
          const isToday = isSameCalendarDay(cell, today);
          const isSelected = selected ? isSameCalendarDay(cell, selected) : false;

          return (
            <View
              key={cell.key}
              className={[
                's-events-calendar__cell',
                hasActivity ? 's-events-calendar__cell--event' : '',
                isToday ? 's-events-calendar__cell--today' : '',
                isSelected ? 's-events-calendar__cell--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="button"
              aria-label={`${month}月${cell.day}日${hasActivity ? t('events.calendarHasActivity') : ''}`}
              onClick={() => onSelectDay(cell.year, cell.month, cell.day)}
            >
              <Text className="s-events-calendar__day">{cell.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
