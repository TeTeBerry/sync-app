import { Image, Text } from '@tarojs/components';

export function ChatUserAvatar({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) {
  const initial =
    name.trim().charAt(0).toUpperCase() ||
    "我";

  if (avatar?.trim()) {
    return (
      <Image
        className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--user"
        src={avatar}
        alt={name}
      />
    );
  }

  return (
    <Text
      className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--user s-ai-assistant-chat__avatar--fallback"
      aria-hidden
    >
      {initial}
    </Text>
  );
}
