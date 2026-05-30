/**
 * H5 / a11y props used in the app but missing from @tarojs/components typings.
 */
import "@tarojs/components";

declare module "@tarojs/components" {
  interface ImageProps {
    alt?: string;
    decoding?: string;
    fetchPriority?: "high" | "low" | "auto";
    loading?: string;
    referrerPolicy?: string;
  }

  interface InputProps {
    onKeyDown?: (event: CommonEvent) => void;
    onConfirm?: () => void;
  }

  interface ViewProps {
    role?: string;
    tabIndex?: number;
    onKeyDown?: (event: CommonEvent & { key?: string; preventDefault?: () => void }) => void;
  }

  interface ButtonProps {
    role?: string;
    "aria-selected"?: boolean;
    "aria-checked"?: boolean;
    "aria-label"?: string;
    "aria-hidden"?: boolean;
  }

  interface TextProps {
    role?: string;
  }
}
