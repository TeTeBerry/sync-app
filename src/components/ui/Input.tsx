import React, { forwardRef, isValidElement, cloneElement, useCallback } from 'react';
import { cn } from './cn';
import {
  Input as TaroInput,
  Text,
  type InputProps as TaroNativeInputProps,
} from '@tarojs/components';

export type InputVariant = `ai-assistant-chat` | `chat` | `events-search`;

const VARIANT_STYLES: Record<
  InputVariant,
  { wrapper?: string; input: string; iconClass?: string; wrapperTag?: `label` | `div` }
> = {
  'ai-assistant-chat': { input: `s-ai-assistant-chat__input` },
  chat: { input: `s-chat__field` },
  'events-search': { input: `s-events__search-input` },
};

function renderIcon(icon: React.ReactNode, iconClass?: string) {
  if (!icon) return null;
  if (!iconClass) return icon;
  if (isValidElement<{ className?: string }>(icon)) {
    return cloneElement(icon, { className: cn(iconClass, icon.props.className) });
  }
  return <Text className={iconClass}>{icon}</Text>;
}

type TaroInputEventHandler = NonNullable<TaroNativeInputProps['onInput']>;

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onInput'
> {
  variant?: InputVariant;
  icon?: React.ReactNode;
  fieldModifier?: string;
  wrapperClassName?: string;
  /** Taro: `onInput` receives `{ detail: { value } }`. */
  onInput?: TaroInputEventHandler;
  /** Taro / mini program: fired when user confirms input (e.g. Enter). */
  onConfirm?: TaroNativeInputProps['onConfirm'];
  /** WeChat: auto-scroll focused input above keyboard (default on weapp chat variants). */
  adjustPosition?: boolean;
  /** WeChat: min distance between cursor and keyboard (px). */
  cursorSpacing?: number;
  /** WeChat: keep keyboard open when tapping other controls. */
  holdKeyboard?: boolean;
  /** WeChat: placeholder text style class. */
  placeholderClass?: string;
  /** WeChat: keyboard confirm button type. */
  confirmType?: TaroNativeInputProps['confirmType'];
}

function toTaroInputValue(
  value: InputProps['value'] | InputProps['defaultValue'],
): string | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.join(',');
  return String(value);
}

function isEnterKeyEvent(
  event: Parameters<NonNullable<TaroNativeInputProps['onKeyDown']>>[0],
): boolean {
  const keyboardEvent = event as KeyboardEvent & {
    detail?: { key?: string; keyCode?: number };
  };
  const key = keyboardEvent.key ?? keyboardEvent.detail?.key;
  const keyCode = keyboardEvent.keyCode ?? keyboardEvent.detail?.keyCode;
  return key === 'Enter' || keyCode === 13;
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
      onInput,
      onConfirm,
      onKeyDown,
      adjustPosition,
      cursorSpacing,
      holdKeyboard,
      confirmType,
      ...props
    },
    ref,
  ) => {
    const isWeapp = process.env.TARO_ENV === 'weapp';
    const weappChatVariant =
      isWeapp && (variant === 'ai-assistant-chat' || variant === 'chat');

    const handleKeyDown = useCallback<NonNullable<TaroNativeInputProps['onKeyDown']>>(
      (event) => {
        onKeyDown?.(event);
        if (!onConfirm || process.env.TARO_ENV !== 'h5') return;
        if (isEnterKeyEvent(event)) {
          onConfirm(event);
        }
      },
      [onConfirm, onKeyDown],
    );

    const controlledValue = toTaroInputValue(value);
    const uncontrolledDefault = toTaroInputValue(defaultValue);

    const taroProps = {
      ...props,
      ...(controlledValue !== undefined ? { value: controlledValue } : {}),
      ...(controlledValue === undefined && uncontrolledDefault !== undefined
        ? { defaultValue: uncontrolledDefault }
        : {}),
      onInput,
      onConfirm,
      onKeyDown: onConfirm || onKeyDown ? handleKeyDown : onKeyDown,
      confirmType: confirmType ?? (onConfirm ? 'send' : undefined),
      ...(weappChatVariant
        ? {
            adjustPosition: adjustPosition ?? true,
            cursorSpacing: cursorSpacing ?? (variant === 'chat' ? 120 : 24),
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
    const inputEl = (
      <TaroInput ref={ref} className={cn(styles.input, className)} {...taroProps} />
    );

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
