import "./chat.scss";
import React from "react";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { goBack } from "../../utils/route";
import { Button, Input } from "../../components/ui";

const AIChat: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="s-chat s-pb-safe">
      <div className="s-chat__header">
        <Button className="s-chat__back" onClick={() => goBack()}>
          <ArrowLeftIcon size={24} />
        </Button>
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
          <Input variant="chat" type="text" placeholder={t("chat.placeholder")} />
          <Button className="s-chat__send">
            <SendIcon size={14} style={{ marginLeft: 2 }} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
