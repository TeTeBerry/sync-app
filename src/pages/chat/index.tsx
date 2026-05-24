import "./chat.scss";
import React from "react";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { goBack } from "../../utils/route";

const AIChat: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="s-chat s-pb-safe">
      <div className="s-chat__header">
        <button type="button" onClick={() => goBack()} className="s-chat__back">
          <ArrowLeftIcon size={24} />
        </button>
        <div className="s-chat__head-main">
          <div className="s-chat__avatar-wrap">
            <span className="s-chat__online" />
            <span className="s-chat__emoji-mark">✨</span>
          </div>
          <div>
            <h2 className="s-chat__name">{t("chat.name")}</h2>
            <p className="s-chat__status">{t("chat.status")}</p>
          </div>
        </div>
      </div>

      <div className="s-chat__msgs">
        <div className="s-chat__bubble-row">
          <div className="s-chat__avatar-sm">
            <span style={{ fontSize: 14, color: "var(--primary)" }}>✨</span>
          </div>
          <div className="s-chat__bubble">
            {t("chat.welcome")}
          </div>
        </div>
      </div>

      <div className="s-chat__footer">
        <div className="s-chat__input-row">
          <input
            type="text"
            placeholder={t("chat.placeholder")}
            className="s-chat__field"
          />
          <button type="button" className="s-chat__send">
            <SendIcon size={14} style={{ marginLeft: 2 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
