import { useState } from 'react';
import { ImagePlus, MessageSquare, Send, X } from '../../../components/icons';
import { useOverlayLock } from '../../../hooks/useOverlayLock';
import { AiBuddyPostShortcutChip } from '../../../components/ai-chat/AiBuddyPostShortcutChip';
import { Button } from '../../../components/ui';
import { Text, Textarea, View, Image } from '@tarojs/components';
import { BUDDY_POST_MAX_IMAGES } from '../../../types/buddyPost';

type EventDetailMessageBoardComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  imageRefs: string[];
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  onPublish: () => void;
  onOpenTemplateSheet: () => void;
  templateDisabled?: boolean;
  publishing?: boolean;
};

export function EventDetailMessageBoardComposer({
  draft,
  onDraftChange,
  imageRefs,
  onPickImages,
  onRemoveImage,
  onPublish,
  onOpenTemplateSheet,
  templateDisabled = false,
  publishing = false,
}: EventDetailMessageBoardComposerProps) {
  const [inputFocused, setInputFocused] = useState(false);
  useOverlayLock(inputFocused);

  const hasContent = Boolean(draft.trim()) || imageRefs.length > 0;

  return (
    <View className="s-event-detail__board">
      <View className="s-event-detail__board-head">
        <View className="s-event-detail__board-head-main">
          <View className="s-event-detail__board-head-icon" aria-hidden>
            <MessageSquare size={18} color="#64d2ff" />
          </View>
          <View className="s-event-detail__board-head-text">
            <Text className="s-event-detail__board-title">活动留言板</Text>
            <Text className="s-event-detail__board-hint">分享想法、提问或找同伴</Text>
          </View>
        </View>
        <AiBuddyPostShortcutChip
          className="s-event-detail__board-template-chip"
          disabled={templateDisabled}
          onClick={onOpenTemplateSheet}
        />
      </View>

      <View className="s-event-detail__board-compose">
        <Textarea
          className="s-event-detail__board-input"
          value={draft}
          placeholder="写下你的留言…"
          placeholderClass="s-event-detail__board-input-placeholder"
          maxlength={500}
          autoHeight
          showConfirmBar={false}
          onInput={(event) => onDraftChange(event.detail.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />

        {imageRefs.length > 0 ? (
          <View className="s-event-detail__board-image-row">
            {imageRefs.map((ref, index) => (
              <View
                key={`${ref}-${index}`}
                className="s-event-detail__board-image-thumb"
              >
                <Image
                  src={ref}
                  mode="aspectFill"
                  className="s-event-detail__board-image-thumb-img"
                />
                <Button
                  className="s-event-detail__board-image-remove"
                  hoverClass="s-event-detail__board-image-remove--pressed"
                  aria-label="移除图片"
                  onClick={() => onRemoveImage(index)}
                >
                  <X size={12} color="#fff" aria-hidden />
                </Button>
              </View>
            ))}
          </View>
        ) : null}

        <View className="s-event-detail__board-toolbar">
          {imageRefs.length < BUDDY_POST_MAX_IMAGES ? (
            <Button
              className="s-event-detail__board-tool-btn"
              hoverClass="s-event-detail__board-tool-btn--pressed"
              aria-label="添加图片"
              onClick={onPickImages}
            >
              <ImagePlus size={18} color="#8e8e93" aria-hidden />
              <Text className="s-event-detail__board-tool-label">图片</Text>
            </Button>
          ) : (
            <View className="s-event-detail__board-tool-spacer" />
          )}

          <Button
            className={[
              's-event-detail__board-send',
              hasContent && 's-event-detail__board-send--active',
            ]
              .filter(Boolean)
              .join(' ')}
            hoverClass="s-event-detail__board-send--pressed"
            disabled={!hasContent || publishing}
            onClick={onPublish}
          >
            <Send size={15} color={hasContent ? '#fff' : '#636366'} aria-hidden />
            <Text className="s-event-detail__board-send-label">
              {publishing ? '发布中' : '发布留言'}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
