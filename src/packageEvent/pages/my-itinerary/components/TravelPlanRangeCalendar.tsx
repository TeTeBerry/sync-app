import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from '../../../../components/icons';
import {
  buildMonthGrid,
  CALENDAR_WEEKDAY_LABELS,
  formatCalendarMonthLabel,
  isSameCalendarDay,
  shiftCalendarMonth,
  todayCalendarParts,
} from '../../../../utils/activityCalendar';
import { Text, View } from '@tarojs/components';
import {
  applyCalendarDayToRange,
  formatTravelPlanRangeSummary,
  isDayInRange,
  normalizeTravelPlanTimeRange,
  partsFromIsoDate,
  type CalendarDay,
  type TravelPlanTimeRange,
} from '../travelPlanDateTime';

type TravelPlanRangeCalendarProps = {
  value: TravelPlanTimeRange;
  onChange: (next: TravelPlanTimeRange) => void;
};

export function TravelPlanRangeCalendar({
  value,
  onChange,
}: TravelPlanRangeCalendarProps) {
  const normalized = useMemo(() => normalizeTravelPlanTimeRange(value), [value]);
  const startParts = partsFromIsoDate(normalized.startDate);
  const endParts = partsFromIsoDate(normalized.endDate);
  const today = todayCalendarParts();

  const [viewMonth, setViewMonth] = useState(() => {
    const anchor = startParts ?? today;
    return { year: anchor.year, month: anchor.month };
  });

  const cells = useMemo(
    () => buildMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth.month, viewMonth.year],
  );

  const handleDaySelect = (day: CalendarDay) => {
    onChange(applyCalendarDayToRange(value, day));
  };

  return (
    <View className="s-travel-plan-range-calendar">
      <View className="s-travel-plan-range-calendar__head">
        <View
          className="s-travel-plan-range-calendar__nav"
          role="button"
          aria-label="上一月"
          onClick={() => {
            const next = shiftCalendarMonth(viewMonth.year, viewMonth.month, -1);
            setViewMonth(next);
          }}
        >
          <ChevronLeft size={16} color="#8e8e93" />
        </View>
        <Text className="s-travel-plan-range-calendar__month">
          {formatCalendarMonthLabel(viewMonth.year, viewMonth.month)}
        </Text>
        <View
          className="s-travel-plan-range-calendar__nav"
          role="button"
          aria-label="下一月"
          onClick={() => {
            const next = shiftCalendarMonth(viewMonth.year, viewMonth.month, 1);
            setViewMonth(next);
          }}
        >
          <ChevronRight size={16} color="#8e8e93" />
        </View>
      </View>

      <View className="s-travel-plan-range-calendar__weekdays">
        {CALENDAR_WEEKDAY_LABELS.map((label) => (
          <Text key={label} className="s-travel-plan-range-calendar__weekday">
            {label}
          </Text>
        ))}
      </View>

      <View className="s-travel-plan-range-calendar__grid">
        {cells.map((cell) => {
          if (cell.kind === 'empty') {
            return (
              <View
                key={cell.key}
                className="s-travel-plan-range-calendar__cell s-travel-plan-range-calendar__cell--empty"
              />
            );
          }

          const inRange =
            startParts && endParts ? isDayInRange(cell, startParts, endParts) : false;
          const isStart = startParts ? isSameCalendarDay(cell, startParts) : false;
          const isEnd = endParts ? isSameCalendarDay(cell, endParts) : false;
          const isToday = isSameCalendarDay(cell, today);

          return (
            <View
              key={cell.key}
              className={[
                's-travel-plan-range-calendar__cell',
                inRange ? 's-travel-plan-range-calendar__cell--in-range' : '',
                isStart ? 's-travel-plan-range-calendar__cell--start' : '',
                isEnd ? 's-travel-plan-range-calendar__cell--end' : '',
                isToday ? 's-travel-plan-range-calendar__cell--today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="button"
              aria-label={`${cell.month}月${cell.day}日`}
              onClick={() => handleDaySelect(cell)}
            >
              <Text className="s-travel-plan-range-calendar__day">{cell.day}</Text>
            </View>
          );
        })}
      </View>

      <Text className="s-travel-plan-range-calendar__summary">
        {formatTravelPlanRangeSummary(normalized)}
      </Text>
    </View>
  );
}
