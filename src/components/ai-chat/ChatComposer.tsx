import React, { type KeyboardEvent, type ClipboardEvent, useCallback, useMemo, useState } from "react";
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
import {
  ChatImageTooLargeError,
  pickAndCompressChatImages,
  fileToDataUrl,
} from "../../utils/chatImage";
import { useAiChatStore } from "../../stores/aiChatStore";
import { validateChatImageDataUrl } from "../../utils/chatImage";

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

const MAX_IMAGES = 6;

type QuickChip = {
  key: string;
  label: string;
  submitText: string;
  isShortcutTag?: boolean;
};

export function ChatComposer({
  input,
  pendingImages,
  isStreaming,
  activityLegacyId,
  onInputChange,
  onSubmit,
  onPendingImagesChange,
  onOpenImagePreview,
}: {
  input: string;
  pendingImages: string[];
  isStreaming: boolean;
  activityLegacyId?: number;
  onInputChange: (value: string) => void;
  onSubmit: (text: string, images?: string[]) => void;
  onPendingImagesChange: (images: string[]) => void;
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

  const handlePickImages = useCallback(async () => {
    if (isStreaming) return;
    const remaining = MAX_IMAGES - pendingImages.length;
    if (remaining <= 0) {
      void Taro.showToast({
        title: `最多上传 ${MAX_IMAGES} 张图片`,
        icon: "none",
      });
      return;
    }
    try {
      const dataUrls = await pickAndCompressChatImages(remaining);
      if (dataUrls.length) {
        onPendingImagesChange([...pendingImages, ...dataUrls].slice(0, MAX_IMAGES));
      }
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
  }, [isStreaming, pendingImages, onPendingImagesChange, t]);

  const removeImage = useCallback(
    (index: number) => {
      onPendingImagesChange(pendingImages.filter((_, i) => i !== index));
    },
    [pendingImages, onPendingImagesChange],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit(input, pendingImages);
      }
    },
    [input, pendingImages, onSubmit],
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent<HTMLInputElement>) => {
      if (isStreaming) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (!imageFiles.length) return;

      e.preventDefault();
      const remaining = MAX_IMAGES - pendingImages.length;
      if (remaining <= 0) {
        void Taro.showToast({
          title: `最多上传 ${MAX_IMAGES} 张图片`,
          icon: "none",
        });
        return;
      }

      const toProcess = imageFiles.slice(0, remaining);
      const newImages: string[] = [];

      for (const file of toProcess) {
        try {
          const dataUrl = await fileToDataUrl(file);
          validateChatImageDataUrl(dataUrl);
          newImages.push(dataUrl);
        } catch (error) {
          if (error instanceof ChatImageTooLargeError) {
            void Taro.showToast({
              title: t("aiAssistant.chat.imageTooLarge"),
              icon: "none",
            });
          }
        }
      }

      if (newImages.length) {
        onPendingImagesChange([...pendingImages, ...newImages].slice(0, MAX_IMAGES));
      }
    },
    [isStreaming, pendingImages, onPendingImagesChange, t],
  );

  const handleQuickChipClick = useCallback(
    (chip: QuickChip) => {
      if (chip.isShortcutTag) {
        recordAiShortcutTagUse(chip.submitText);
        setShortcutTags(getTopAiShortcutTags());
      }
      onSubmit(chip.submitText, pendingImages);
    },
    [onSubmit, pendingImages],
  );

  const canSend = Boolean(input.trim() || pendingImages.length) && !isStreaming;

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
        {pendingImages.length > 0 ? (
          <div className="s-ai-assistant-chat__attach-preview-list">
            {pendingImages.map((src, index) => (
              <div key={`${src.slice(0, 40)}-${index}`} className="s-ai-assistant-chat__attach-thumb">
                <button
                  type="button"
                  className="s-ai-assistant-chat__attach-preview-btn"
                  aria-label={t("aiAssistant.chat.viewImage")}
                  onClick={() => onOpenImagePreview(src)}
                >
                  <img src={src} alt={t("aiAssistant.chat.uploadedImageAlt")} />
                </button>
                <button
                  type="button"
                  className="s-ai-assistant-chat__attach-remove"
                  aria-label={t("aiAssistant.chat.removeImage")}
                  onClick={() => removeImage(index)}
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="s-ai-assistant-chat__composer-inner">
          <button
            type="button"
            className="s-ai-assistant-chat__attach-btn"
            disabled={isStreaming || pendingImages.length >= MAX_IMAGES}
            aria-label={t("aiAssistant.chat.uploadImage")}
            onClick={() => void handlePickImages()}
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
            onPaste={handlePaste}
          />
          <Button
            className={cn(
              "s-ai-assistant-chat__send",
              canSend && "s-ai-assistant-chat__send--active",
            )}
            disabled={!canSend}
            onClick={() => onSubmit(input, pendingImages)}
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
