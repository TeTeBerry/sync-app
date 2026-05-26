import React, { type KeyboardEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Taro from "@tarojs/taro";
import { ImagePlusIcon, SendIcon, ShieldIcon, XIcon } from "lucide-react";
import { Button, Input, cn } from "../ui";
import { normalizeAiShortcutTag } from "../../utils/aiShortcutTags";
import { ChatImageTooLargeError, pickAndCompressChatImage } from "../../utils/chatImage";

const quickReplyKeys = [`findBuddy`, `nearEvents`] as const;

export function ChatComposer({
  input,
  pendingImage,
  isStreaming,
  onInputChange,
  onSubmit,
  onPendingImageChange,
  onOpenImagePreview,
}: {
  input: string;
  pendingImage: string | null;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (text: string, image?: string | null) => void;
  onPendingImageChange: (image: string | null) => void;
  onOpenImagePreview: (src: string) => void;
}) {
  const { t } = useTranslation();

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

  const canSend = Boolean(input.trim() || pendingImage) && !isStreaming;

  return (
    <>
      <div className="s-ai-assistant-chat__quick-row s-scrollbar-none">
        {quickReplyKeys.map((key) => (
          <Button
            key={key}
            className="s-ai-assistant-chat__quick-chip"
            disabled={isStreaming}
            onClick={() =>
              onSubmit(
                normalizeAiShortcutTag(t(`aiAssistant.chat.quickReplies.${key}`)),
              )
            }
          >
            {t(`aiAssistant.chat.quickReplies.${key}`)}
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
            placeholder={t("aiAssistant.chat.placeholder")}
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
