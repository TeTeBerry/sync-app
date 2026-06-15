import './PostBodyWithContact.scss';
import { Text, View } from '@tarojs/components';
import { WechatEmojiText } from '../wechat-emoji/WechatEmojiText';

export type PostBodyWithContactProps = {
  publicBody: string;
  contact?: string;
  expanded: boolean;
  textClassName: string;
  useWechatEmoji?: boolean;
  onContactToggle?: () => void;
};

export function PostBodyWithContact({
  publicBody,
  contact,
  expanded,
  textClassName,
  useWechatEmoji = false,
  onContactToggle,
}: PostBodyWithContactProps) {
  if (!publicBody && !contact) {
    return null;
  }

  const handleContactToggle = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
    onContactToggle?.();
  };

  return (
    <View className="s-post-body-contact">
      {publicBody ? (
        useWechatEmoji ? (
          <WechatEmojiText text={publicBody} className={textClassName} />
        ) : (
          <Text className={textClassName}>{publicBody}</Text>
        )
      ) : null}
      {contact ? (
        expanded ? (
          <View className="s-post-body-contact__revealed" onClick={handleContactToggle}>
            <Text className="s-post-body-contact__label">联系方式</Text>
            <Text className="s-post-body-contact__value" selectable>
              {contact}
            </Text>
            <Text className="s-post-body-contact__hint s-post-body-contact__hint--collapse">
              点击收起
            </Text>
          </View>
        ) : (
          <Text className="s-post-body-contact__hint" onClick={handleContactToggle}>
            点击查看联系方式
          </Text>
        )
      ) : null}
    </View>
  );
}
