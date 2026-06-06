import './ExploreShareComposer.scss';
import Taro from '@tarojs/taro';
import { useCallback, useState, type FC } from 'react';
import { Image, Text, View } from '@tarojs/components';
import { Button, Input } from '../../../components/ui';
import { ImageIcon, MapPin, Send, Smile, X } from '../../../components/icons';
import { WechatEmojiPanel } from '../../../components/wechat-emoji/WechatEmojiPanel';
import type { WechatEmojiItem } from '../../../constants/wechatEmoji';
import {
  ChatImageTooLargeError,
  pickAndCompressChatImages,
} from '../../../utils/chatImage';
import { openImagePreview } from '../../../utils/openImagePreview';
import { thumbnailImageUrl } from '../../../utils/imageUrl';
import { requireAuth } from '../../../utils/authGate';

const MAX_IMAGES = 6;

type ExploreShareComposerProps = {
  avatar?: string;
  onPublish: (payload: { body: string; images: string[] }) => Promise<boolean>;
};

export const ExploreShareComposer: FC<ExploreShareComposerProps> = ({
  avatar,
  onPublish,
}) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);

  const avatarSrc =
    thumbnailImageUrl(avatar, 80) ??
    avatar ??
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80&fit=crop&crop=face';

  const handlePickImages = useCallback(async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      void Taro.showToast({ title: `最多上传 ${MAX_IMAGES} 张图片`, icon: 'none' });
      return;
    }
    try {
      const picked = await pickAndCompressChatImages(remaining);
      if (picked.length) {
        setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      if (error instanceof ChatImageTooLargeError) {
        void Taro.showToast({ title: '图片过大，请压缩至 10MB 以内', icon: 'none' });
        return;
      }
      void Taro.showToast({ title: '请求失败，请稍后重试', icon: 'none' });
    }
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleEmojiPanel = useCallback(() => {
    setEmojiPanelOpen((open) => {
      const next = !open;
      if (next) {
        void Taro.hideKeyboard();
      }
      return next;
    });
  }, []);

  const handleEmojiSelect = useCallback((emoji: WechatEmojiItem) => {
    setText((prev) => `${prev}${emoji.label}`);
  }, []);

  const handlePublish = useCallback(() => {
    if (publishing) return;
    const trimmed = text.trim();
    if (!trimmed && !images.length) {
      void Taro.showToast({ title: '写点什么或添加图片吧', icon: 'none' });
      return;
    }

    requireAuth(() => {
      setPublishing(true);
      void (async () => {
        try {
          const ok = await onPublish({ body: trimmed, images });
          if (ok) {
            setText('');
            setImages([]);
            setEmojiPanelOpen(false);
            void Taro.showToast({ title: '发布成功', icon: 'success' });
          }
        } finally {
          setPublishing(false);
        }
      })();
    }, 'social');
  }, [images, onPublish, publishing, text]);

  const canPublish = Boolean(text.trim() || images.length) && !publishing;

  return (
    <View className="s-explore-composer">
      <View className="s-explore-composer__top">
        <Image
          className="s-explore-composer__avatar"
          src={avatarSrc}
          mode="aspectFill"
        />
        <Input
          type="text"
          value={text}
          placeholder="分享你的电音现场瞬间..."
          className="s-explore-composer__input"
          onInput={(e) => setText(e.detail.value)}
        />
      </View>

      {images.length > 0 ? (
        <View className="s-explore-composer__preview-row">
          {images.map((src, index) => (
            <View
              key={`${src.slice(0, 24)}-${index}`}
              className="s-explore-composer__thumb"
            >
              <Button
                className="s-explore-composer__thumb-btn"
                aria-label="查看大图"
                onClick={() => void openImagePreview(images, index)}
              >
                <Image
                  className="s-explore-composer__thumb-img"
                  src={src}
                  mode="aspectFill"
                />
              </Button>
              <Button
                className="s-explore-composer__thumb-remove"
                aria-label="移除图片"
                onClick={() => removeImage(index)}
              >
                <X size={12} color="#fff" />
              </Button>
            </View>
          ))}
        </View>
      ) : null}

      {emojiPanelOpen ? <WechatEmojiPanel onSelect={handleEmojiSelect} /> : null}

      <View className="s-explore-composer__footer">
        <View className="s-explore-composer__tools">
          <Button
            className="s-explore-composer__tool-btn"
            aria-label="上传图片"
            disabled={images.length >= MAX_IMAGES}
            onClick={() => void handlePickImages()}
          >
            <ImageIcon size={18} color="#8e8e93" />
          </Button>
          <Button
            className={[
              's-explore-composer__tool-btn',
              emojiPanelOpen && 's-explore-composer__tool-btn--active',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label="表情"
            onClick={toggleEmojiPanel}
          >
            <Smile size={18} color={emojiPanelOpen ? 'var(--primary)' : '#8e8e93'} />
          </Button>
          <Button
            className="s-explore-composer__tool-btn"
            aria-label="位置"
            onClick={() =>
              void Taro.showToast({ title: '已默认关联当前活动场地', icon: 'none' })
            }
          >
            <MapPin size={18} color="#8e8e93" />
          </Button>
        </View>

        <Button
          className={[
            's-explore-composer__publish',
            canPublish && 's-explore-composer__publish--active',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={!canPublish}
          onClick={handlePublish}
        >
          <Send size={14} color="#fff" />
          <Text className="s-explore-composer__publish-text">发布</Text>
        </Button>
      </View>
    </View>
  );
};
