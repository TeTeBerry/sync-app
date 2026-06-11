import { beforeEach, describe, expect, it } from 'vitest';
import type { ChatUiMessage } from '@/types/aiChat';
import { useAiChatStore } from '@/stores/aiChatStore';

const sampleMessage = (id: string): ChatUiMessage => ({
  id,
  from: 'user',
  text: `msg-${id}`,
});

describe('aiChatStore ephemeral buckets', () => {
  beforeEach(() => {
    useAiChatStore.getState().clearAllEphemeralChat();
  });

  it('stores messages per activity scope', () => {
    const store = useAiChatStore.getState();
    store.setScopeMessages('activity:4', [sampleMessage('a')]);
    store.setScopeMessages('activity:9', [sampleMessage('b')]);

    expect(store.getScopeMessages('activity:4')[0]?.text).toBe('msg-a');
    expect(store.getScopeMessages('activity:9')[0]?.text).toBe('msg-b');
  });

  it('clears streaming flag when restoring messages', () => {
    useAiChatStore
      .getState()
      .setScopeMessages('global', [
        { id: '1', from: 'ai', text: '…', streaming: true },
      ]);

    const restored = useAiChatStore.getState().getScopeMessages('global');
    expect(restored[0]?.streaming).toBe(false);
  });

  it('resetScope clears bucket conversation metadata', () => {
    const store = useAiChatStore.getState();
    store.setActiveScope('activity:1');
    store.setScopeMessages('activity:1', [sampleMessage('x')]);
    store.applyConversationPatch({ flow: 'collect_post_body' } as never);

    store.resetScope('activity:1');

    expect(store.getScopeMessages('activity:1')).toEqual([]);
    expect(
      useAiChatStore.getState().buckets['activity:1']?.conversationState,
    ).toBeNull();
  });

  it('clearAllEphemeralChat wipes every scope', () => {
    const store = useAiChatStore.getState();
    store.setScopeMessages('global', [sampleMessage('g')]);
    store.clearAllEphemeralChat();
    expect(store.getScopeMessages('global')).toEqual([]);
    expect(useAiChatStore.getState().activeScopeKey).toBeNull();
  });
});
