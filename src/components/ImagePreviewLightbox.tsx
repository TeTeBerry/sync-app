import "./ImagePreviewLightbox.scss";
import React, { useCallback, useEffect } from "react";
import { X } from "lucide-react-taro";
import { useOverlayLock } from "../hooks/useOverlayLock";
import { cn } from "./ui";
import { Button, Image, View } from '@tarojs/components';

export interface ImagePreviewLightboxProps {
  open: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
}

const ImagePreviewLightbox: React.FC<ImagePreviewLightboxProps> = ({
  open,
  src,
  alt,
  onClose,
}) => {
  useOverlayLock(open);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, open]);

  if (!src) return null;

  return (
    <View
      className={cn("s-overlay s-image-preview", !open && "s-overlay--off")}
      style={{ zIndex: "var(--overlay-z-lightbox)" }}
      role="presentation"
    >
      <View className="s-overlay__backdrop s-image-preview__backdrop" onClick={onClose} />
      <Button
        type="button"
        className="s-overlay__icon-btn s-image-preview__close"
        aria-label="关闭"
        onClick={onClose}
      >
        <X size={22} />
      </Button>
      <View className="s-image-preview__stage" onClick={onClose}>
        <Image
          className="s-image-preview__img"
          src={src}
          alt={alt ?? "已上传的图片"}
          onClick={(event) => event.stopPropagation()}
        />
      </View>
    </View>
  );
};

export default ImagePreviewLightbox;
