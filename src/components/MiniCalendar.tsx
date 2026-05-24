import "./MiniCalendar.scss";
import React, { useEffect, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const WEEK_DAYS = [`日`, `一`, `二`, `三`, `四`, `五`, `六`];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, `0`);
  const day = String(d.getDate()).padStart(2, `0`);
  return `${y}/${m}/${day}`;
}

function parseValue(v: string): Date | null {
  if (!v) return null;
  const parts = v.split(`/`);
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export type MiniCalendarAccent = `primary` | `secondary` | `amber`;

interface MiniCalendarProps {
  value: string;
  onChange: (v: string) => void;
  accent?: MiniCalendarAccent;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, accent = `secondary` }) => {
  const { t } = useTranslation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = parseValue(value);
  const initView = selectedDate || today;
  const [viewYear, setViewYear] = useState(initView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initView.getMonth());

  useEffect(() => {
    const parsed = parseValue(value);
    if (!parsed) return;
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSel = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < today;
  };

  return (
    <div data-cmp="MiniCalendar" className={`s-mini-cal s-mini-cal--${accent}`}>
      <div className="s-mini-cal__head">
        <button type="button" onClick={prevMonth} className="s-mini-cal__nav" aria-label="Previous month">
          <ChevronLeftIcon size={14} />
        </button>
        <span className="s-mini-cal__title">
          {viewYear} 年 {viewMonth + 1} 月
        </span>
        <button type="button" onClick={nextMonth} className="s-mini-cal__nav" aria-label="Next month">
          <ChevronRightIcon size={14} />
        </button>
      </div>

      <div className="s-mini-cal__weeks">
        {WEEK_DAYS.map((w) => (
          <div key={w} className="s-mini-cal__week">
            {w}
          </div>
        ))}
      </div>

      <div className="s-mini-cal__grid">
        {cells.map((day, idx) => {
          const sel = day !== null && isSel(day);
          const tod = day !== null && isToday(day);
          const past = day !== null && isPast(day);

          return (
            <div key={idx} className="s-mini-cal__cell">
              <button
                type="button"
                disabled={day === null || past}
                onClick={() => {
                  if (!day || past) return;
                  onChange(formatDate(new Date(viewYear, viewMonth, day)));
                }}
                className={[
                  `s-mini-cal__day`,
                  day === null ? `s-mini-cal__day--empty` : ``,
                  sel ? `s-mini-cal__day--selected` : ``,
                  !sel && tod ? `s-mini-cal__day--today` : ``,
                  !sel && !tod && !past && day !== null ? `s-mini-cal__day--idle` : ``,
                  past && !sel ? `s-mini-cal__day--past` : ``,
                ]
                  .filter(Boolean)
                  .join(` `)}
              >
                {day ?? ``}
              </button>
            </div>
          );
        })}
      </div>

      <div className="s-mini-cal__foot">
        <CalendarIcon size={12} />
        <span className="s-mini-cal__foot-text">
          {value ? <strong>{value}</strong> : t("aimatch.pindan.modal.pickDate")}
        </span>
      </div>
    </div>
  );
};

export { formatDate };
export default MiniCalendar;
