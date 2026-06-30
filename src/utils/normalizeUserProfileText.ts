import type { CurrentUser, UpdateCurrentUserPayload } from '../types/backend';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import { normalizePercentEncodedText } from './normalizePercentEncodedText';

/** Decode percent-encoded city labels from router params / legacy profile rows. */
export function normalizeUserCity(value?: string | null): string | undefined {
  const decoded = normalizePercentEncodedText(value ?? '').trim();
  return decoded || undefined;
}

export function normalizeCurrentUserProfile(user: CurrentUser): CurrentUser {
  const city = user.city ? normalizeUserCity(user.city) : undefined;
  if (city === user.city) {
    return user;
  }
  return { ...user, ...(city ? { city } : {}) };
}

export function normalizeUpdateCurrentUserPayload(
  payload: UpdateCurrentUserPayload,
): UpdateCurrentUserPayload {
  if (payload.city === undefined) {
    return payload;
  }
  const city = normalizeUserCity(payload.city);
  if (city === payload.city) {
    return payload;
  }
  return { ...payload, ...(city ? { city } : { city: undefined }) };
}

export function normalizeAiGuidePlanFormValues(
  form: AiGuidePlanFormValues,
): AiGuidePlanFormValues {
  const departure = normalizePercentEncodedText(form.departure ?? '').trim();
  const departureCity = form.departureCity
    ? normalizeUserCity(form.departureCity)
    : undefined;
  if (departure === form.departure && departureCity === form.departureCity) {
    return form;
  }
  return {
    ...form,
    departure,
    ...(departureCity ? { departureCity } : {}),
  };
}
