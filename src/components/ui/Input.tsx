import React, { forwardRef, isValidElement, cloneElement } from "react";
import { cn } from "./cn";

export type InputVariant =
  | `aim-modal-full`
  | `aim-modal-half`
  | `ticket-field`
  | `home-ai`
  | `aim-chat`
  | `chat`;

const VARIANT_STYLES: Record<
  InputVariant,
  { wrapper?: string; input: string; iconClass?: string; wrapperTag?: `label` | `div` }
> = {
  "aim-modal-full": { input: `s-aim-modal__field-full` },
  "aim-modal-half": { input: `s-aim-modal__field-half` },
  "ticket-field": {
    wrapper: `s-ticket-modal__field`,
    input: `s-ticket-modal__input`,
    iconClass: `s-ticket-modal__field-icon`,
    wrapperTag: `label`,
  },
  "home-ai": { wrapper: `s-home-ai__input-shell`, input: `s-home-ai__field`, wrapperTag: `div` },
  "aim-chat": { input: `s-aim-ai__input` },
  chat: { input: `s-chat__field` },
};

function renderIcon(icon: React.ReactNode, iconClass?: string) {
  if (!icon) return null;
  if (!iconClass) return icon;
  if (isValidElement<{ className?: string }>(icon)) {
    return cloneElement(icon, { className: cn(iconClass, icon.props.className) });
  }
  return <span className={iconClass}>{icon}</span>;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Maps to existing project input BEM classes */
  variant?: InputVariant;
  /** Left adornment (ticket-field / home-ai) */
  icon?: React.ReactNode;
  /** ticket-field modifier, e.g. `seat` → `__field--seat` */
  fieldModifier?: string;
  wrapperClassName?: string;
}

/**
 * Wrapper around `<input>` that preserves existing visual styles per variant.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, icon, fieldModifier, wrapperClassName, className, ...props }, ref) => {
    if (!variant) {
      return <input ref={ref} className={className} {...props} />;
    }

    const styles = VARIANT_STYLES[variant];
    const inputEl = <input ref={ref} className={cn(styles.input, className)} {...props} />;

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
