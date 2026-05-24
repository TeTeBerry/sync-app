import "./PageNavigation.scss";
import React, { type ReactNode } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { goBack } from "../utils/route";
import { Button } from "./ui";

export interface PageNavigationProps {
  title: string;
  onBack?: () => void;
  /** 右侧操作区，建议 36×36 按钮以保持标题居中 */
  trailing?: ReactNode;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ title, onBack = goBack, trailing }) => {
  return (
    <header data-cmp="PageNavigation" className="s-page-nav">
      <Button block="s-page-nav" element="icon-btn" modifiers={[`back`]} onClick={() => onBack()}>
        <ChevronLeftIcon size={20} />
      </Button>
      <h1 className="s-page-nav__title s-line-clamp-1">{title}</h1>
      <div className="s-page-nav__trailing">{trailing ?? <span className="s-page-nav__spacer" />}</div>
    </header>
  );
};

export default PageNavigation;
