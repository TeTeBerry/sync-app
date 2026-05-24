import { ChevronRightIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

type SectionChevronLinkProps = {
  label?: string;
  labelKey?: string;
  /** 不传则渲染为静态行（无手势） */
  onNavigate?: () => void;
};

/**
 * 分区右侧「文案 + chevron」；有回调时用 button 语义，便于无障碍与小屏触控。
 */
export const SectionChevronLink: FC<SectionChevronLinkProps> = ({ label, labelKey, onNavigate }) => {
  const { t } = useTranslation();
  const text = labelKey ? t(labelKey) : (label ?? ``);

  const content: ReactNode = (
    <>
      <span>{text}</span>
      <ChevronRightIcon size={13} />
    </>
  );

  if (onNavigate) {
    return (
      <button type="button" className="s-hot-section__link" onClick={onNavigate}>
        {content}
      </button>
    );
  }

  return <div className="s-hot-section__link">{content}</div>;
};
