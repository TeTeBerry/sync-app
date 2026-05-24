import { SendIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { type FC, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

type HomeAiAssistantProps = {
  onSummon: () => void;
};

/**
 * 首页 AI 搭子助手：输入与会话跳转由上层控制路由。
 */
export const HomeAiAssistant: FC<HomeAiAssistantProps> = ({ onSummon }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(``);

  const submit = useCallback(() => {
    if (!query.trim()) return;
    onSummon();
  }, [onSummon, query]);

  return (
    <section className="s-home-ai">
      <div className="s-home-ai__head-row">
        <div className="s-home-ai__bot-wrap">
          <div className="s-home-ai__bot-face">
            <SparklesIcon size={18} />
          </div>
          <span className="s-home-ai__dot s-pulse" />
        </div>
        <div className="s-home-ai__meta">
          <div className="s-home-ai__meta-head">
            <span className="s-home-ai__title-text">{t("home.ai.title")}</span>
            <span className="s-home-ai__badge">{t("common.agent")}</span>
          </div>
          <p className="s-home-ai__sub">{t("home.ai.online")}</p>
        </div>
        <button type="button" className="s-home-ai__cta" onClick={onSummon}>
          <ZapIcon size={12} />
          {t("home.ai.summon")}
        </button>
      </div>

      <div className="s-home-ai__field-row">
        <div className="s-home-ai__input-shell">
          <SparklesIcon size={13} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === `Enter`) submit();
            }}
            placeholder={t("home.ai.placeholder")}
            className="s-home-ai__field"
          />
        </div>
        <button type="button" className="s-home-ai__send" onClick={submit}>
          <SendIcon size={15} />
        </button>
      </div>
    </section>
  );
};
