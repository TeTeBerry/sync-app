import { useTranslation } from "react-i18next";

export function ChatUserAvatar({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) {
  const { t } = useTranslation();
  const initial =
    name.trim().charAt(0).toUpperCase() ||
    t("aiAssistant.chat.avatarFallbackInitial");

  if (avatar?.trim()) {
    return (
      <img
        className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--user"
        src={avatar}
        alt={name}
      />
    );
  }

  return (
    <span
      className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--user s-ai-assistant-chat__avatar--fallback"
      aria-hidden
    >
      {initial}
    </span>
  );
}
