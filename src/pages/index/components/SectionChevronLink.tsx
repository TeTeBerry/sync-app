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
 * 分区右侧「文案 + chevron」；有回调时保持 div 样式，避免 button 默认背景。
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
      <div
        className="s-home-section__link"
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={(e) => {
          if (e.key === `Enter` || e.key === ` `) {
            e.preventDefault();
            onNavigate();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return <div className="s-home-section__link">{content}</div>;
};
