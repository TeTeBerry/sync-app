import './WechatEmojiText.scss';
import type { FC } from 'react';
import { Image, Text, View } from '@tarojs/components';
import { splitWechatEmojiText, wechatEmojiImageUrl } from '../../constants/wechatEmoji';

type WechatEmojiTextProps = {
  text: string;
  className?: string;
};

/** Renders post text with WeChat `[微笑]` labels as inline emoji images. */
export const WechatEmojiText: FC<WechatEmojiTextProps> = ({ text, className }) => {
  const parts = splitWechatEmojiText(text);

  if (parts.length === 1 && parts[0].type === 'text') {
    return <Text className={className}>{text}</Text>;
  }

  return (
    <View className={['s-wechat-emoji-text', className].filter(Boolean).join(' ')}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <Text key={`t-${index}`} className="s-wechat-emoji-text__segment">
              {part.value}
            </Text>
          );
        }

        return (
          <Image
            key={`e-${index}-${part.label}`}
            className="s-wechat-emoji-text__emoji"
            src={wechatEmojiImageUrl(part.file)}
            mode="aspectFit"
          />
        );
      })}
    </View>
  );
};
