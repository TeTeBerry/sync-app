import React, { useCallback, useMemo, useState } from "react";
import Taro from "@tarojs/taro";
import { ImagePlus, Send, Shield, X } from "lucide-react-taro";
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
} from "../../utils/chatImage";
import { useAiChatStore } from "../../stores/aiChatStore";
import { openImagePreview } from "../../utils/openImagePreview";
import { Image, ScrollView, Text, View } from "@tarojs/components";

const SHORTCUT_TAG_LABELS: Record<AiShortcutTag, string> = {
  组队队友: "组队队友",
  住宿同行: "住宿同行",
  拼车同行: "拼车同行",
};

const globalQuickChips = [
  { key: "findBuddy", label: "帮我dd", submitText: "帮我dd" },
  { key: "nearEvents", label: "查最近活动", submitText: "查最近活动" },
  { key: "findPartner", label: "帮我找搭子", submitText: "帮我找搭子" },
  { key: "popularEvents", label: "热门活动", submitText: "查最近活动" },
] as const;

const activityActionChips = [
  { key: "createOwn", label: "自己发帖", submitText: "自己发帖" },
  { key: "searchPosts", label: "查组队帖", submitText: "看看有没有组队帖" },
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
}: {
  input: string;
  pendingImages: string[];
  isStreaming: boolean;
  activityLegacyId?: number;
  onInputChange: (value: string) => void;
  onSubmit: (text: string, images?: string[]) => void;
  onPendingImagesChange: (images: string[]) => void;
}) {
  const [shortcutTags, setShortcutTags] = useState(() => getTopAiShortcutTags());
  const conversationFlow = useAiChatStore((state) => state.conversationState?.flow);

  const inputPlaceholder =
    conversationFlow === "collect_post_body"
      ? "描述你的组队需求，如出发地、人数、日期…"
      : "说说你想去哪、想找什么样的同行…";

  const quickChips = useMemo((): QuickChip[] => {
    if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
      const tagChips: QuickChip[] = shortcutTags.map((tag) => {
        const label = SHORTCUT_TAG_LABELS[tag as AiShortcutTag] ?? tag;
        return {
          key: `tag-${tag}`,
          label,
          submitText: normalizeAiShortcutTag(tag),
          isShortcutTag: true,
        };
      });

      const actionChips: QuickChip[] = activityActionChips.map((chip) => ({
        key: chip.key,
        label: chip.label,
        submitText: chip.submitText,
      }));

      return [actionChips[0], ...tagChips, ...actionChips.slice(1)];
    }

    return globalQuickChips.map((chip) => ({
      key: chip.key,
      label: chip.label,
      submitText: chip.submitText,
    }));
  }, [activityLegacyId, shortcutTags]);

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
          title: "图片过大，请压缩至 10MB 以内",
          icon: "none",
        });
        return;
      }
      void Taro.showToast({ title: "请求失败，请稍后重试", icon: "none" });
    }
  }, [isStreaming, pendingImages, onPendingImagesChange]);

  const removeImage = useCallback(
    (index: number) => {
      onPendingImagesChange(pendingImages.filter((_, i) => i !== index));
    },
    [pendingImages, onPendingImagesChange],
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
      <View className="s-ai-assistant-chat__quick-row s-scrollbar-none">
        {quickChips.map((chip) => (
          <Button
            key={chip.key}
            className="s-ai-assistant-chat__quick-chip"
            disabled={isStreaming}
            onClick={() => handleQuickChipClick(chip)}>
            {chip.label}
          </Button>
        ))}
      </View>

      <View className="s-ai-assistant-chat__composer">
        {pendingImages.length> 0 ? (
          <ScrollView
            scrollY
            enhanced
            showScrollbar={false}
            className="s-ai-assistant-chat__attach-preview-list s-scrollbar-none"
            style={{ height: "160px" }}>
            {pendingImages.map((src, index) => (
              <View key={`${src.slice(0, 40)}-${index}`} className="s-ai-assistant-chat__attach-thumb">
                <Button className="s-ai-assistant-chat__attach-preview-btn"
                  aria-label="查看大图"
                  onClick={() => void openImagePreview(pendingImages, index)}>
                  <Image src={src} alt="已上传的图片" />
                </Button>
                <Button className="s-ai-assistant-chat__attach-remove"
                  aria-label="移除图片"
                  onClick={() => removeImage(index)}>
                  <X size={14} />
                </Button>
              </View>
            ))}
          </ScrollView>
        ) : null}
        <View className="s-ai-assistant-chat__composer-inner">
          <Button className="s-ai-assistant-chat__attach-btn"
            disabled={isStreaming || pendingImages.length>= MAX_IMAGES}
            aria-label="上传图片"
            onClick={() => void handlePickImages()}>
            <ImagePlus size={18} />
          </Button>
          <Input
            variant="ai-assistant-chat"
            type="text"
            value={input}
            disabled={isStreaming}
            placeholder={inputPlaceholder}
            onChange={(e) => onInputChange(e.target.value)}
            onConfirm={() => onSubmit(input, pendingImages)}
          />
          <Button
            className={cn(
              "s-ai-assistant-chat__send",
              canSend && "s-ai-assistant-chat__send--active",
            )}
            disabled={!canSend}
            onClick={() => onSubmit(input, pendingImages)}>
            <Send size={16} />
          </Button>
        </View>
        <Text className="s-ai-assistant-chat__disclaimer">
          <Shield size={12} aria-hidden />
          <Text>AI 内容仅供参考</Text>
        </Text>
      </View>
    </>
  );
}
