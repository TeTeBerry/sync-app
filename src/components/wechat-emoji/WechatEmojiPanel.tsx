import './WechatEmojiPanel.scss';
import type { FC } from 'react';
import { Image, ScrollView, View } from '@tarojs/components';
import { Button } from '../ui';
import {
  WECHAT_EMOJI_LIST,
  wechatEmojiImageUrl,
  type WechatEmojiItem,
} from '../../constants/wechatEmoji';

type WechatEmojiPanelProps = {
  onSelect: (emoji: WechatEmojiItem) => void;
};

export const WechatEmojiPanel: FC<WechatEmojiPanelProps> = ({ onSelect }) => {
  return (
    <ScrollView
      scrollY
      enhanced
      showScrollbar={false}
      className="s-wechat-emoji-panel s-scrollbar-none"
    >
      <View className="s-wechat-emoji-panel__grid">
        {WECHAT_EMOJI_LIST.map((emoji) => (
          <Button
            key={emoji.label}
            className="s-wechat-emoji-panel__item"
            aria-label={emoji.label}
            onClick={() => onSelect(emoji)}
          >
            <Image
              className="s-wechat-emoji-panel__img"
              src={wechatEmojiImageUrl(emoji.file)}
              mode="aspectFit"
            />
          </Button>
        ))}
      </View>
    </ScrollView>
  );
};
