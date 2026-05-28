import React, { forwardRef } from "react";
import { bem } from "./bem";
import { cn } from "./cn";
import { Button as TaroButton } from '@tarojs/components';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** BEM block prefix, e.g. `s-aim-modal` */
  block?: string;
  /** BEM element name, e.g. `submit` → `s-aim-modal__submit` */
  element?: string;
  /** BEM modifiers appended as `--modifier` */
  modifiers?: Array<string | false | null | undefined>;
}

/**
 * Thin wrapper around `<Button>` that composes existing BEM classes.
 * Pass `className` directly, or use `block` + `element` + `modifiers`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ block, element, modifiers, className, type = `button`, ...props }, ref) => {
    const bemClass = block && element ? bem(block, element, modifiers) : undefined;
    return <TaroButton ref={ref} type={type} className={cn(bemClass, className)} {...props} />;
  },
);

Button.displayName = `Button`;

export default Button;
