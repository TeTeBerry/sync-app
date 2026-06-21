import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import { useAiChatStore } from '../../stores/aiChatStore';
import { AI_ASSISTANT_DISCLAIMER } from '../../constants/aiDisclosure';
import { useT } from '@/hooks/useI18n';
import { isWeappRuntime } from '@/pages/ai/assistant/aiChatLayout.util';
import { Text, View, type InputProps as TaroInputProps } from '@tarojs/components';

function readComposerInputValue(
  event: Parameters<NonNullable<TaroInputProps['onInput']>>[0],
): string {
  return event.detail?.value ?? '';
}

export const ChatComposer = memo(function ChatComposer({
  isStreaming,
  activityLegacyId,
  activityTitle,
  onSubmit,
  onClearChat,
  clearDisabled = false,
  resetKey = 0,
}: {
  isStreaming: boolean;
  activityLegacyId?: number;
  activityTitle?: string;
  onSubmit: (text: string) => void | Promise<void>;
  onClearChat?: () => void | Promise<void>;
  clearDisabled?: boolean;
  /** Bump after clear-chat so the local draft resets without lifting input state. */
  resetKey?: number;
}) {
  const [input, setInput] = useState('');
  const [canSend, setCanSend] = useState(false);
  const [weappInputKey, setWeappInputKey] = useState(0);
  const draftRef = useRef('');
  const t = useT();

  const resetDraft = useCallback(() => {
    draftRef.current = '';
    setInput('');
    setCanSend(false);
    if (isWeappRuntime) {
      setWeappInputKey((key) => key + 1);
    }
  }, []);

  useEffect(() => {
    resetDraft();
  }, [resetKey, resetDraft]);

  const conversationFlow = useAiChatStore((state) =>
    state.activeScopeKey
      ? state.buckets[state.activeScopeKey]?.conversationState?.flow
      : undefined,
  );

  const scopedToActivity = activityLegacyId != null && !Number.isNaN(activityLegacyId);
  const trimmedActivityTitle = activityTitle?.trim();

  const inputPlaceholder = (() => {
    if (conversationFlow === 'collect_post_body') {
      return scopedToActivity && trimmedActivityTitle
        ? t('ai.composerPlaceholderBound', { title: trimmedActivityTitle })
        : t('ai.composerPlaceholderUnbound');
    }
    if (scopedToActivity && trimmedActivityTitle) {
      return t('ai.composerPlaceholderActivity', { title: trimmedActivityTitle });
    }
    return t('ai.composerPlaceholderDefault');
  })();

  const isComposerDisabled = isStreaming;
  const sendEnabled =
    (isWeappRuntime ? canSend : Boolean(input.trim())) && !isComposerDisabled;

  const handleSend = useCallback(() => {
    const trimmed = isWeappRuntime ? draftRef.current.trim() : input.trim();
    if (!trimmed || isComposerDisabled) return;
    resetDraft();
    void Promise.resolve(onSubmit(trimmed));
  }, [input, isComposerDisabled, onSubmit, resetDraft]);

  const handleInputChange = useCallback((value: string) => {
    draftRef.current = value;
    if (isWeappRuntime) {
      setCanSend(Boolean(value.trim()));
      return;
    }
    setInput(value);
  }, []);

  const composerInputKey = isWeappRuntime
    ? `composer-${resetKey}-${weappInputKey}`
    : `composer-${resetKey}`;

  return (
    <View className="s-ai-assistant-chat__composer">
      <View className="s-ai-assistant-chat__composer-inner">
        <Input
          key={composerInputKey}
          variant="ai-assistant-chat"
          type="text"
          {...(isWeappRuntime ? { defaultValue: '' } : { value: input })}
          disabled={isComposerDisabled}
          placeholder={inputPlaceholder}
          adjustPosition={false}
          cursorSpacing={12}
          holdKeyboard={isWeappRuntime}
          alwaysEmbed={isWeappRuntime}
          confirmType="send"
          onInput={(e) => handleInputChange(readComposerInputValue(e))}
          onConfirm={handleSend}
        />
        <Button
          className="s-ai-assistant-chat__clear-btn"
          disabled={clearDisabled}
          aria-label={t('ai.clearConversation')}
          onClick={() => void onClearChat?.()}
        >
          <Trash2 size={16} color="#ef4444" />
        </Button>
        <Button
          className={cn(
            's-ai-assistant-chat__send',
            sendEnabled && 's-ai-assistant-chat__send--active',
          )}
          disabled={!sendEnabled}
          onClick={handleSend}
        >
          <Send size={16} />
        </Button>
      </View>
      <Text className="s-ai-assistant-chat__composer-disclaimer">
        {AI_ASSISTANT_DISCLAIMER}
      </Text>
    </View>
  );
});
