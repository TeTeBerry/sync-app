import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import type { ConfirmDialogOptions } from '../../../../hooks/useConfirmDialog';
import {
  resolveWelcomeCapabilityChipAction,
  isActivityBoundForCapabilities,
} from '../../../../utils/aiAssistantCapabilityDiscovery';
import type { SendChatOptions } from '../../../../types/aiChat';
import type { useAiCapabilityRunner } from './useAiCapabilityRunner';

type CapabilityRunner = ReturnType<typeof useAiCapabilityRunner>;

export function useAiAssistantComposer(options: {
  activityLegacyId?: number;
  isStreaming: boolean;
  isStreamingRef: MutableRefObject<boolean>;
  send: (payload: string | SendChatOptions) => Promise<void>;
  clearChat: () => Promise<void>;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  capabilityRunner: CapabilityRunner;
  openPersonalityTest: () => void;
  openActivityPicker: () => void;
}) {
  const {
    activityLegacyId,
    isStreaming,
    isStreamingRef,
    send,
    clearChat,
    confirm,
    capabilityRunner,
    openPersonalityTest,
    openActivityPicker,
  } = options;

  const [input, setInput] = useState('');
  const submitLockRef = useRef(false);

  const submit = useCallback(
    async (text: string) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      if (!trimmed || isStreaming || isStreamingRef.current) {
        return;
      }

      submitLockRef.current = true;
      try {
        setInput('');
        await send({ text: trimmed });
      } finally {
        submitLockRef.current = false;
      }
    },
    [isStreaming, isStreamingRef, send],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming || isStreamingRef.current) return;

    const ok = await confirm({
      title: '清空对话',
      message:
        '确定清空当前聊天记录？将重新开始本场对话，上方「本场计划」进度不受影响。',
    });
    if (!ok) return;

    await clearChat();
  }, [clearChat, confirm, isStreaming, isStreamingRef]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming || isStreamingRef.current) {
        return;
      }
      const trimmed = reply.trim();
      if (!trimmed) return;

      if (capabilityRunner.runFromSuggestedReplyLabel(trimmed, 'chat')) {
        return;
      }

      const capabilityAction = resolveWelcomeCapabilityChipAction(
        trimmed,
        isActivityBoundForCapabilities(activityLegacyId),
      );
      if (capabilityAction) {
        switch (capabilityAction.type) {
          case 'send':
            submitLockRef.current = true;
            try {
              await send({ text: capabilityAction.text });
            } finally {
              submitLockRef.current = false;
            }
            return;
          case 'personality_test':
            openPersonalityTest();
            return;
          case 'pick_festival_sheet':
            openActivityPicker();
            return;
          default:
            if (capabilityRunner.runFromWelcomeChipAction(capabilityAction, 'chat')) {
              return;
            }
        }
      }

      submitLockRef.current = true;
      try {
        await send({ text: trimmed });
      } finally {
        submitLockRef.current = false;
      }
    },
    [
      activityLegacyId,
      capabilityRunner,
      isStreaming,
      isStreamingRef,
      openActivityPicker,
      openPersonalityTest,
      send,
    ],
  );

  return {
    input,
    setInput,
    submit,
    handleClearChat,
    handleSelectSuggestedReply,
  };
}
