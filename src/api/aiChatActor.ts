import { hasAuthenticatedRequest } from './requestContext';
import {
  getClientUserId,
  getClientUserName,
  getClientUserPhone,
} from '../utils/session';

/** WebSocket `send` body identity — JWT on upgrade; demo uses body fields. */
export function buildAiChatWsSendActor(): {
  userId?: string;
  userName?: string;
  userPhone?: string;
} {
  const userPhone = getClientUserPhone()?.trim();
  const phoneField = userPhone ? { userPhone } : {};

  if (hasAuthenticatedRequest()) {
    return phoneField;
  }

  return {
    userId: getClientUserId(),
    userName: getClientUserName(),
    ...phoneField,
  };
}
