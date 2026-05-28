import React, { forwardRef } from "react";
import { bem } from "./bem";
import { cn } from "./cn";
import { Button as TaroButton } from "@tarojs/components";
import type { ButtonProps as TaroButtonProps } from "@tarojs/components";

export interface ButtonProps extends TaroButtonProps {
  /** BEM block prefix, e.g. `s-aim-modal` */
  block?: string;
  /** BEM element name, e.g. `submit` → `s-aim-modal__submit` */
  element?: string;
  /** BEM modifiers appended as `--modifier` */
  modifiers?: Array<string | false | null | undefined>;
}

/**
 * Thin wrapper around Taro `<Button>` that composes existing BEM classes.
 * Pass `className` directly, or use `block` + `element` + `modifiers`.
 * Use Taro `type` (`primary` | `default` | `warn`) for style variants, not HTML button types.
 */
export const Button = forwardRef<unknown, ButtonProps>(
  ({ block, element, modifiers, className, ...props }, ref) => {
    const bemClass = block && element ? bem(block, element, modifiers) : undefined;
    return <TaroButton ref={ref} className={cn(bemClass, className)} {...props} />;
  },
);

Button.displayName = `Button`;

export default Button;
