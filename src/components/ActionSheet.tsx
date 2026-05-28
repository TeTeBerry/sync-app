import "./ActionSheet.scss";
import React from "react";
import { useOverlayLock } from "../hooks/useOverlayLock";
import { cn } from "./ui";
import { Button, Text, View } from '@tarojs/components';

export interface ActionSheetItem {
  label: string;
  active?: boolean;
  onSelect: () => void;
}

export interface ActionSheetProps {
  open: boolean;
  title?: string;
  items: ActionSheetItem[];
  cancelLabel: string;
  onCancel: () => void;
}

const ActionSheet: React.FC<ActionSheetProps> = ({
  open,
  title,
  items,
  cancelLabel,
  onCancel,
}) => {
  useOverlayLock(open);

  return (
    <View
      className={cn("s-overlay s-overlay--sheet", !open && "s-overlay--off")}
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onCancel} />
      <View className="s-overlay__panel" role="menu" aria-hidden={!open}>
        {title ? <Text className="s-overlay-sheet__title">{title}</Text> : null}
        {items.map((item) => (
          <Button
            key={item.label}
            type="button"
            role="menuitem"
            className={cn(
              "s-overlay-sheet__item",
              item.active && "s-overlay-sheet__item--active",
            )}
            onClick={item.onSelect}
          >
            {item.label}
          </Button>
        ))}
        <Button type="button" className="s-overlay-sheet__cancel" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </View>
    </View>
  );
};

export default ActionSheet;
