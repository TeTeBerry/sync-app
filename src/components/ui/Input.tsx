import React, { forwardRef, isValidElement, cloneElement } from "react";
import { cn } from "./cn";
import { Input as TaroInput, Text } from '@tarojs/components';

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
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, icon, fieldModifier, wrapperClassName, className, ...props }, ref) => {
    if (!variant) {
      return <TaroInput ref={ref} className={className} {...props} />;
    }

    const styles = VARIANT_STYLES[variant];
    const inputEl = <TaroInput ref={ref} className={cn(styles.input, className)} {...props} />;

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
