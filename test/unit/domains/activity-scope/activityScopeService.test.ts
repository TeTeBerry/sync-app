import { beforeEach, describe, expect, it } from 'vitest';
import { useAiChatStore } from '@/stores/aiChatStore';
import {
  bindActivity,
  clearActivityScope,
  getActiveActivityLegacyId,
  getActivityScopeHeaders,
} from '@/domains/activity-scope';

describe('activityScopeService', () => {
  beforeEach(() => {
    clearActivityScope();
    useAiChatStore.setState({
      activeScopeKey: null,
      buckets: {},
    });
  });

  it('binds navigation store and chat scope', () => {
    bindActivity(4, { activityName: 'Storm', syncChatWelcome: true });

    expect(getActiveActivityLegacyId()).toBe(4);
    expect(useAiChatStore.getState().activeScopeKey).toBe('activity:4');
    expect(useAiChatStore.getState().getScopeMessages('activity:4')).toHaveLength(1);
    expect(getActivityScopeHeaders()).toEqual({ 'X-Activity-Id': '4' });
  });

  it('clears scope back to global', () => {
    bindActivity(4);
    clearActivityScope();

    expect(getActiveActivityLegacyId()).toBeNull();
    expect(useAiChatStore.getState().activeScopeKey).toBe('global');
    expect(getActivityScopeHeaders()).toEqual({});
  });
});
