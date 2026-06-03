import { getCacheData } from '../hooks/useApiQuery';
import type { BackendActivity } from '../types/backend';
import type { TempChatSession } from '../types/tempChat';
import { findBackendActivityByLegacyId } from './apiMappers';

/** Temp chats are removed this many days after the festival ends. */
export const TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT = 3;

const DEFAULT_FESTIVAL_YEAR = 2026;

/** Fallback when activity cache is empty (matches backend seed). */
const MOCK_ACTIVITY_DATE_BY_LEGACY_ID: Record<number, string> = {
  1: '12/11-13',
  2: '03/22-23',
  4: '06/13-14',
  5: '12/18-20',
  6: '04/18-19',
};

function inferYearFromActivityName(name?: string): number {
  const match = name?.match(/(20\d{2})/);
  if (match) {
    const year = Number(match[1]);
    if (Number.isFinite(year)) return year;
  }
  return DEFAULT_FESTIVAL_YEAR;
}

function endOfLocalDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfLocalDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Parse festival `date` label to the last calendar day of the event. */
export function parseActivityEndDate(
  dateLabel?: string,
  year = DEFAULT_FESTIVAL_YEAR,
): Date | null {
  const raw = dateLabel?.trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const parsed = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(parsed.getTime()) ? null : endOfLocalDay(parsed);
  }

  const slashRange = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\s*[-–~至]\s*(\d{1,2}))?$/);
  if (slashRange) {
    const month = Number(slashRange[1]);
    const startDay = Number(slashRange[2]);
    const endDay = slashRange[3] ? Number(slashRange[3]) : startDay;
    if (!month || !endDay) return null;
    const parsed = new Date(year, month - 1, endDay);
    return Number.isNaN(parsed.getTime()) ? null : endOfLocalDay(parsed);
  }

  const dotRange = raw.match(/(\d{1,2})[./月](\d{1,2})\s*[-–~至]\s*(\d{1,2})/);
  if (dotRange) {
    const month = Number(dotRange[1]);
    const endDay = Number(dotRange[3]);
    const parsed = new Date(year, month - 1, endDay);
    return Number.isNaN(parsed.getTime()) ? null : endOfLocalDay(parsed);
  }

  return null;
}

export function getActivityEndDateIso(endDate: Date): string {
  return endOfLocalDay(endDate).toISOString();
}

export function getTempChatDestroysAt(endDate: Date): Date {
  return startOfLocalDay(
    addDays(endOfLocalDay(endDate), TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT),
  );
}

export function getTempChatDestroysAtIso(endDate: Date): string {
  return getTempChatDestroysAt(endDate).toISOString();
}

export function resolveActivityEndDateForLegacyId(
  activityLegacyId: number,
): Date | null {
  const activities = getCacheData<BackendActivity[]>(['activities']);
  const fromList = activities
    ? findBackendActivityByLegacyId(activities, activityLegacyId)
    : undefined;
  const detail = getCacheData<BackendActivity>([
    'activities',
    'detail',
    activityLegacyId,
  ]);
  const activity = fromList ?? detail;
  const dateLabel = activity?.date ?? MOCK_ACTIVITY_DATE_BY_LEGACY_ID[activityLegacyId];
  if (!dateLabel) return null;
  return parseActivityEndDate(dateLabel, inferYearFromActivityName(activity?.name));
}

export function buildTempChatRetentionFields(activityLegacyId?: number): {
  activityLegacyId?: number;
  activityEndAt?: string;
  destroysAt?: string;
} {
  if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
    return {};
  }
  const endDate = resolveActivityEndDateForLegacyId(activityLegacyId);
  if (!endDate) {
    return { activityLegacyId };
  }
  return {
    activityLegacyId,
    activityEndAt: getActivityEndDateIso(endDate),
    destroysAt: getTempChatDestroysAtIso(endDate),
  };
}

export function formatTempChatDestroysAtLabel(destroysAtIso?: string): string | null {
  if (!destroysAtIso) return null;
  const date = new Date(destroysAtIso);
  if (Number.isNaN(date.getTime())) return null;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month} 月 ${day} 日`;
}

export function formatTempChatRetentionNotice(
  session: Pick<TempChatSession, 'destroysAt' | 'postTitle'>,
): string {
  const label = formatTempChatDestroysAtLabel(session.destroysAt);
  if (label) {
    return `临时会话将在「${session.postTitle}」结束 ${TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT} 天后（预计 ${label}）自动销毁，请及时沟通。`;
  }
  return `临时会话将在电音节结束 ${TEMP_CHAT_RETENTION_DAYS_AFTER_EVENT} 天后自动销毁，请及时沟通。`;
}

export function isTempChatSessionExpired(
  session: Pick<TempChatSession, 'destroysAt'>,
  now = Date.now(),
): boolean {
  if (!session.destroysAt) return false;
  const destroysAt = new Date(session.destroysAt).getTime();
  return Number.isFinite(destroysAt) && now >= destroysAt;
}

/** Fill retention fields when missing (e.g. legacy local sessions). */
export function coerceTempChatSession(session: TempChatSession): TempChatSession {
  if (session.destroysAt != null) return session;
  return { ...session, ...buildTempChatRetentionFields(session.activityLegacyId) };
}

export function isActiveTempChatSession(session: TempChatSession): boolean {
  return !isTempChatSessionExpired(coerceTempChatSession(session));
}

export function filterActiveTempChatSessions(
  sessions: TempChatSession[],
): TempChatSession[] {
  return sessions.filter(isActiveTempChatSession);
}
