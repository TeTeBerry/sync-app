import { useTranslation } from "react-i18next";
import { useAiChatStore } from "../../stores/aiChatStore";

export function DegradedMatchBanner() {
  const { t } = useTranslation();
  const degraded = useAiChatStore((state) => state.degraded);

  if (!degraded) return null;

  return (
    <p className="s-ai-assistant-chat__degraded-banner" role="status">
      {t("aiAssistant.chat.degradedMatchHint")}
    </p>
  );
}
