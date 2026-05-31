import React, { forwardRef, isValidElement, cloneElement } from "react";
import { cn } from "./cn";
import {
  Input as TaroInput,
  Text,
  type InputProps as TaroNativeInputProps,
} from "@tarojs/components";

export type InputVariant = `ai-assistant-chat` | `chat`;

const VARIANT_STYLES: Record<
  InputVariant,
  { wrapper?: string; input: string; iconClass?: string; wrapperTag?: `label` | `div` }
> = {
  "ai-assistant-chat": { input: `s-ai-assistant-chat__input` },
  chat: { input: `s-chat__field` },
};

function renderIcon(icon: React.ReactNode, iconClass?: string) {
  if (!icon) return null;
  if (!iconClass) return icon;
  if (isValidElement<{ className?: string }>(icon)) {
    return cloneElement(icon, { className: cn(iconClass, icon.props.className) });
  }
  return <Text className={iconClass}>{icon}</Text>;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  icon?: React.ReactNode;
  fieldModifier?: string;
  wrapperClassName?: string;
  /** Taro / mini program: fired when user confirms input (e.g. Enter). */
  onConfirm?: () => void;
  /** WeChat: auto-scroll focused input above keyboard (default on weapp chat variants). */
  adjustPosition?: boolean;
  /** WeChat: min distance between cursor and keyboard (px). */
  cursorSpacing?: number;
  /** WeChat: keep keyboard open when tapping other controls. */
  holdKeyboard?: boolean;
}

function toTaroInputValue(
  value: InputProps["value"] | InputProps["defaultValue"],
): string | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      icon,
      fieldModifier,
      wrapperClassName,
      className,
      value,
      defaultValue,
      onConfirm,
      adjustPosition,
      cursorSpacing,
      holdKeyboard,
      ...props
    },
    ref,
  ) => {
    const isWeapp = process.env.TARO_ENV === "weapp";
    const weappChatVariant = isWeapp && (variant === "ai-assistant-chat" || variant === "chat");

    const taroProps = {
      ...props,
      value: toTaroInputValue(value),
      defaultValue: toTaroInputValue(defaultValue),
      onConfirm,
      ...(weappChatVariant
        ? {
            adjustPosition: adjustPosition ?? true,
            cursorSpacing: cursorSpacing ?? (variant === "chat" ? 120 : 24),
          }
        : {
            ...(adjustPosition != null ? { adjustPosition } : {}),
            ...(cursorSpacing != null ? { cursorSpacing } : {}),
          }),
      ...(holdKeyboard != null ? { holdKeyboard } : {}),
    } as TaroNativeInputProps & { onConfirm?: () => void };

    if (!variant) {
      return <TaroInput ref={ref} className={className} {...taroProps} />;
    }

    const styles = VARIANT_STYLES[variant];
    const inputEl = <TaroInput ref={ref} className={cn(styles.input, className)} {...taroProps} />;

    if (!styles.wrapper) return inputEl;

    const Wrapper = styles.wrapperTag ?? `div`;
    const wrapperClass = cn(
      styles.wrapper,
      fieldModifier && `${styles.wrapper}--${fieldModifier}`,
      wrapperClassName,
    );

    return (
      <Wrapper className={wrapperClass}>
        {renderIcon(icon, styles.iconClass)}
        {inputEl}
      </Wrapper>
    );
  },
);

Input.displayName = `Input`;

export default Input;
