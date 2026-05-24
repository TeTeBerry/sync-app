import "./JoinSuccessToast.scss";
import React, { useEffect } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

export type JoinSuccessToastProps = {
  visible: boolean;
  title?: string;
  onView: () => void;
  onDismiss: () => void;
  durationMs?: number;
};

const JoinSuccessToast: React.FC<JoinSuccessToastProps> = ({
  visible,
  title,
  onView,
  onDismiss,
  durationMs = 3000,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [visible, durationMs, onDismiss]);

  return (
    <div
      className={`s-join-toast${visible ? " s-join-toast--visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="s-join-toast__icon" aria-hidden>
        <CheckCircle2Icon size={20} />
      </span>
      <div className="s-join-toast__body">
        <div className="s-join-toast__title">{t("pindan.joinSuccess.title")}</div>
        {title && <div className="s-join-toast__sub">{title}</div>}
      </div>
      <button type="button" className="s-join-toast__action" onClick={onView}>
        {t("common.view")}
      </button>
      {visible && (
        <div className="s-join-toast__progress" aria-hidden>
          <div className="s-join-toast__progress-fill" style={{ animationDuration: `${durationMs}ms` }} />
        </div>
      )}
    </div>
  );
};

export default JoinSuccessToast;
