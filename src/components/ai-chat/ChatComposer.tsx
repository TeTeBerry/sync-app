import React, { type KeyboardEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Taro from "@tarojs/taro";
import { ImagePlusIcon, SendIcon, ShieldIcon, XIcon } from "lucide-react";
import { Button, Input, cn } from "../ui";
import {
  getTopAiShortcutTags,
  normalizeAiShortcutTag,
  recordAiShortcutTagUse,
  type AiShortcutTag,
} from "../../utils/aiShortcutTags";
import { ChatImageTooLargeError, pickAndCompressChatImage } from "../../utils/chatImage";
import { useAiChatStore } from "../../stores/aiChatStore";

const SHORTCUT_TAG_LABEL_KEYS: Record<AiShortcutTag, string> = {
  组队队友: "teamUp",
  住宿同行: "lodging",
  拼车同行: "carpool",
};

const globalQuickChips = [
  { key: "findBuddy", submitText: "帮我dd" },
  { key: "nearEvents", submitText: "查最近活动" },
  { key: "findPartner", submitText: "帮我找搭子" },
  { key: "popularEvents", submitText: "查最近活动" },
] as const;

const activityActionChips = [
  { key: "createOwn", submitText: "自己发帖" },
  { key: "searchPosts", submitText: "看看有没有组队帖" },
] as const;

type QuickChip = {
  key: string;
  label: string;
  submitText: string;
  isShortcutTag?: boolean;
};

export function ChatComposer({
  input,
  pendingImage,
  isStreaming,
  activityLegacyId,
  onInputChange,
  onSubmit,
  onPendingImageChange,
  onOpenImagePreview,
}: {
  input: string;
  pendingImage: string | null;
  isStreaming: boolean;
  activityLegacyId?: number;
  onInputChange: (value: string) => void;
  onSubmit: (text: string, image?: string | null) => void;
  onPendingImageChange: (image: string | null) => void;
  onOpenImagePreview: (src: string) => void;
}) {
  const { t } = useTranslation();
  const [shortcutTags, setShortcutTags] = useState(() => getTopAiShortcutTags());
  const conversationFlow = useAiChatStore((state) => state.conversationState?.flow);

  const inputPlaceholder =
    conversationFlow === "collect_post_body"
      ? t("aiAssistant.chat.customPostPlaceholder")
      : t("aiAssistant.chat.placeholder");

  const quickChips = useMemo((): QuickChip[] => {
    if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
      const tagChips: QuickChip[] = shortcutTags.map((tag) => {
        const labelKey = SHORTCUT_TAG_LABEL_KEYS[tag as AiShortcutTag];
        return {
          key: `tag-${tag}`,
          label: labelKey
            ? t(`aiAssistant.chat.quickReplies.${labelKey}`)
            : tag,
          submitText: normalizeAiShortcutTag(tag),
          isShortcutTag: true,
        };
      });

      const actionChips: QuickChip[] = activityActionChips.map((chip) => ({
        key: chip.key,
        label: t(`aiAssistant.chat.quickReplies.${chip.key}`),
        submitText: chip.submitText,
      }));

      return [actionChips[0], ...tagChips, ...actionChips.slice(1)];
    }

    return globalQuickChips.map((chip) => ({
      key: chip.key,
      label: t(`aiAssistant.chat.quickReplies.${chip.key}`),
      submitText: chip.submitText,
    }));
  }, [activityLegacyId, shortcutTags, t]);

  const handlePickImage = useCallback(async () => {
    if (isStreaming) return;
    try {
      const dataUrl = await pickAndCompressChatImage();
      if (dataUrl) onPendingImageChange(dataUrl);
    } catch (error) {
      if (error instanceof ChatImageTooLargeError) {
        void Taro.showToast({
          title: t("aiAssistant.chat.imageTooLarge"),
          icon: "none",
        });
        return;
      }
      void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
    }
  }, [isStreaming, onPendingImageChange, t]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit(input);
      }
    },
    [input, onSubmit],
  );

  const handleQuickChipClick = useCallback(
    (chip: QuickChip) => {
      if (chip.isShortcutTag) {
        recordAiShortcutTagUse(chip.submitText);
        setShortcutTags(getTopAiShortcutTags());
      }
      onSubmit(chip.submitText);
    },
    [onSubmit],
  );

  const canSend = Boolean(input.trim() || pendingImage) && !isStreaming;

  return (
    <>
      <div className="s-ai-assistant-chat__quick-row s-scrollbar-none">
        {quickChips.map((chip) => (
          <Button
            key={chip.key}
            className="s-ai-assistant-chat__quick-chip"
            disabled={isStreaming}
            onClick={() => handleQuickChipClick(chip)}
          >
            {chip.label}
          </Button>
        ))}
      </div>

      <div className="s-ai-assistant-chat__composer">
        {pendingImage ? (
          <div className="s-ai-assistant-chat__attach-preview">
            <button
              type="button"
              className="s-ai-assistant-chat__attach-preview-btn"
              aria-label={t("aiAssistant.chat.viewImage")}
              onClick={() => onOpenImagePreview(pendingImage)}
            >
              <img src={pendingImage} alt={t("aiAssistant.chat.uploadedImageAlt")} />
            </button>
            <button
              type="button"
              className="s-ai-assistant-chat__attach-remove"
              aria-label={t("aiAssistant.chat.removeImage")}
              onClick={() => onPendingImageChange(null)}
            >
              <XIcon size={14} />
            </button>
          </div>
        ) : null}
        <div className="s-ai-assistant-chat__composer-inner">
          <button
            type="button"
            className="s-ai-assistant-chat__attach-btn"
            disabled={isStreaming}
            aria-label={t("aiAssistant.chat.uploadImage")}
            onClick={() => void handlePickImage()}
          >
            <ImagePlusIcon size={18} />
          </button>
          <Input
            variant="ai-assistant-chat"
            type="text"
            value={input}
            disabled={isStreaming}
            placeholder={inputPlaceholder}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Button
            className={cn(
              "s-ai-assistant-chat__send",
              canSend && "s-ai-assistant-chat__send--active",
            )}
            disabled={!canSend}
            onClick={() => onSubmit(input)}
          >
            <SendIcon size={16} />
          </Button>
        </div>
        <p className="s-ai-assistant-chat__disclaimer">
          <ShieldIcon size={12} aria-hidden />
          <span>{t("aiAssistant.chat.footerDisclaimer")}</span>
        </p>
      </div>
    </>
  );
}
