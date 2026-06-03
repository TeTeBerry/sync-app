import Taro from '@tarojs/taro';
import { create } from 'zustand';
import type {
  OpenTempChatSessionInput,
  TempChatMessage,
  TempChatSession,
} from '../types/tempChat';
import {
  buildTempChatRetentionFields,
  isTempChatSessionExpired,
} from '../utils/tempChatRetention';
import { buildTeamChatSessionId } from '../utils/teamChatSessionId';

const STORAGE_KEY = 'sync_temp_chat_v1';

type PersistedTempChat = {
  sessions: TempChatSession[];
  messages: TempChatMessage[];
};

function readPersisted(): PersistedTempChat {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (!raw || typeof raw !== 'object') {
      return { sessions: [], messages: [] };
    }
    const data = raw as PersistedTempChat;
    return {
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      messages: Array.isArray(data.messages) ? data.messages : [],
    };
  } catch {
    return { sessions: [], messages: [] };
  }
}

function writePersisted(state: PersistedTempChat) {
  try {
    Taro.setStorageSync(STORAGE_KEY, state);
  } catch {
    // ignore quota / unavailable storage
  }
}

function buildSessionId(postId: string, applicantUserId: string) {
  return buildTeamChatSessionId(postId, applicantUserId);
}

function sortSessions(sessions: TempChatSession[]) {
  return [...sessions].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

function normalizeSession(session: TempChatSession): TempChatSession {
  const retention =
    session.destroysAt != null
      ? {
          activityLegacyId: session.activityLegacyId,
          activityEndAt: session.activityEndAt,
          destroysAt: session.destroysAt,
        }
      : buildTempChatRetentionFields(session.activityLegacyId);

  const applicantUserId =
    session.applicantUserId?.trim() || session.peerUserId?.trim() || '';

  return {
    ...session,
    applicantUserId,
    id:
      session.id ||
      (session.postId && applicantUserId
        ? buildTeamChatSessionId(session.postId, applicantUserId)
        : session.id),
    ...retention,
    applicationStatus: session.applicationStatus ?? 'pending',
    postRecruitmentStatus: session.postRecruitmentStatus ?? '招募中',
    isOwner: session.isOwner ?? true,
  };
}

function purgeExpiredSessions(state: PersistedTempChat): PersistedTempChat {
  const keptSessionIds = new Set<string>();
  const sessions = state.sessions.map(normalizeSession).filter((session) => {
    if (isTempChatSessionExpired(session)) return false;
    keptSessionIds.add(session.id);
    return true;
  });
  const messages = state.messages.filter((message) =>
    keptSessionIds.has(message.sessionId),
  );
  return { sessions, messages };
}

export interface TempChatState {
  sessions: TempChatSession[];
  messages: TempChatMessage[];
  hydrated: boolean;
  hydrate: () => void;
  purgeExpiredSessions: () => void;
  openSessionFromApplication: (input: OpenTempChatSessionInput) => string;
  markApplicationAccepted: (sessionId: string) => void;
  markSessionRead: (sessionId: string) => void;
  sendMessage: (sessionId: string, body: string) => void;
  getSession: (sessionId: string) => TempChatSession | undefined;
  listMessages: (sessionId: string) => TempChatMessage[];
}

export const useTempChatStore = create<TempChatState>((set, get) => ({
  sessions: [],
  messages: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const persisted = purgeExpiredSessions(readPersisted());
    writePersisted(persisted);
    set({
      sessions: persisted.sessions,
      messages: persisted.messages,
      hydrated: true,
    });
  },

  purgeExpiredSessions: () => {
    if (!get().hydrated) return;
    const persisted = purgeExpiredSessions({
      sessions: get().sessions,
      messages: get().messages,
    });
    writePersisted(persisted);
    set({
      sessions: persisted.sessions,
      messages: persisted.messages,
    });
  },

  getSession: (sessionId) => get().sessions.find((item) => item.id === sessionId),

  listMessages: (sessionId) =>
    get()
      .messages.filter((item) => item.sessionId === sessionId)
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),

  markSessionRead: (sessionId) => {
    const nextSessions = get().sessions.map((session) =>
      session.id === sessionId ? { ...session, unreadCount: 0 } : session,
    );
    set({ sessions: nextSessions });
    writePersisted({ sessions: nextSessions, messages: get().messages });
  },

  openSessionFromApplication: (input) => {
    const sessionId = buildSessionId(input.postId, input.applicantUserId);
    const now = new Date().toISOString();
    const firstBody = input.applicationMessage?.trim() || '你好，我想加入你的组队～';
    const existing = get().sessions.find((item) => item.id === sessionId);

    let nextSessions: TempChatSession[];
    let nextMessages = get().messages;

    const applicationStatus = input.applicationStatus ?? 'pending';
    const postRecruitmentStatus = input.postRecruitmentStatus ?? '招募中';
    const retention = buildTempChatRetentionFields(input.activityLegacyId);

    if (existing) {
      nextSessions = sortSessions(
        get().sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                applicantUserId: input.applicantUserId,
                peerName: input.peerName,
                peerAvatar: input.peerAvatar ?? session.peerAvatar,
                postTitle: input.postTitle,
                buddyInfo: input.buddyInfo,
                isOwner: input.isOwner ?? session.isOwner,
                ...retention,
                applicationStatus:
                  session.applicationStatus === 'accepted'
                    ? 'accepted'
                    : applicationStatus,
                postRecruitmentStatus:
                  session.postRecruitmentStatus === '已组队'
                    ? '已组队'
                    : postRecruitmentStatus,
                unreadCount: 0,
              }
            : session,
        ),
      );
    } else {
      const session: TempChatSession = {
        id: sessionId,
        applicantUserId: input.applicantUserId,
        peerUserId: input.peerUserId,
        peerName: input.peerName,
        peerAvatar: input.peerAvatar,
        postId: input.postId,
        postTitle: input.postTitle,
        buddyInfo: input.buddyInfo,
        lastMessage: firstBody,
        lastMessageAt: now,
        unreadCount: 0,
        applicationStatus,
        postRecruitmentStatus,
        isOwner: input.isOwner ?? true,
        ...retention,
      };
      nextSessions = sortSessions([session, ...get().sessions]);
      const firstMessage: TempChatMessage = {
        id: `${sessionId}-m0`,
        sessionId,
        role: 'peer',
        body: firstBody,
        createdAt: now,
      };
      nextMessages = [...nextMessages, firstMessage];
    }

    set({ sessions: nextSessions, messages: nextMessages, hydrated: true });
    writePersisted({ sessions: nextSessions, messages: nextMessages });
    return sessionId;
  },

  markApplicationAccepted: (sessionId) => {
    const nextSessions = get().sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            applicationStatus: 'accepted' as const,
            postRecruitmentStatus: '已组队' as const,
          }
        : session,
    );
    set({ sessions: nextSessions });
    writePersisted({ sessions: nextSessions, messages: get().messages });
  },

  sendMessage: (sessionId, body) => {
    const trimmed = body.trim();
    if (!trimmed) return;

    const session = get().sessions.find((item) => item.id === sessionId);
    if (!session) return;

    const now = new Date().toISOString();
    const message: TempChatMessage = {
      id: `${sessionId}-m${Date.now()}`,
      sessionId,
      role: 'me',
      body: trimmed,
      createdAt: now,
    };
    const nextMessages = [...get().messages, message];
    const nextSessions = sortSessions(
      get().sessions.map((item) =>
        item.id === sessionId
          ? {
              ...item,
              lastMessage: trimmed,
              lastMessageAt: now,
            }
          : item,
      ),
    );
    set({ sessions: nextSessions, messages: nextMessages });
    writePersisted({ sessions: nextSessions, messages: nextMessages });
  },
}));
