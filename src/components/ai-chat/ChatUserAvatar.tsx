import { Image, Text } from "@tarojs/components";
import { cn } from "../ui";
import type { AuthorGender } from "../../utils/inferAuthorGender";

export function ChatUserAvatar({
  avatar,
  name,
  userGender,
}: {
  avatar?: string;
  name: string;
  userGender?: AuthorGender;
}) {
  const initial =
    name.trim().charAt(0).toUpperCase() ||
    "我";

  const genderClass =
    userGender === "female"
      ? "s-ai-assistant-chat__avatar--user--female"
      : userGender === "male"
        ? "s-ai-assistant-chat__avatar--user--male"
        : undefined;

  if (avatar?.trim()) {
    return (
      <Image
        className={cn(
          "s-ai-assistant-chat__avatar",
          "s-ai-assistant-chat__avatar--user",
          genderClass,
        )}
        src={avatar}
        alt={name}
      />
    );
  }

  return (
    <Text
      className={cn(
        "s-ai-assistant-chat__avatar",
        "s-ai-assistant-chat__avatar--user",
        "s-ai-assistant-chat__avatar--fallback",
        userGender === "female" && "s-ai-assistant-chat__avatar--fallback--female",
        userGender === "male" && "s-ai-assistant-chat__avatar--fallback--male",
      )}
      aria-hidden>
      {initial}
    </Text>
  );
}
