import Taro from '@tarojs/taro';
import { API_BASE_URL } from '../../../constants/api';
import {
  extractYearFromText,
  parseActivityDateRange,
} from '../../../utils/activityStatus';
import { showAppToast } from '@/utils/appToast';

type EventCalendarInput = {
  eventId: number;
  title?: string;
  date?: string;
  location?: string;
};

export function useEventDetailAddToCalendar(input: EventCalendarInput) {
  const handleAddToCalendar = async () => {
    const title = input.title?.trim();
    if (!title || input.eventId <= 0) return;

    const yearHint =
      extractYearFromText(input.date) ??
      extractYearFromText(title) ??
      String(new Date().getFullYear());
    const range = input.date ? parseActivityDateRange(input.date, yearHint) : null;
    const startMs = range?.start.getTime() ?? Date.now();
    const endMs = range?.end.getTime() ?? startMs + 3_600_000;

    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      try {
        await Taro.addPhoneCalendar({
          title,
          startTime: Math.floor(startMs / 1000),
          endTime: String(Math.floor(endMs / 1000)),
          location: input.location?.trim() ?? '',
        });
        showAppToast('eventDetail.addToCalendarSuccess', 'success');
        return;
      } catch {
        // fall through to ICS link copy
      }
    }

    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/public/events/${input.eventId}.ics`;
    try {
      await Taro.setClipboardData({ data: url });
      showAppToast('eventDetail.calendarLinkCopied');
    } catch {
      showAppToast('eventDetail.addToCalendarFailed');
    }
  };

  return { handleAddToCalendar };
}
