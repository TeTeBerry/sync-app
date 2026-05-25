import "./ImagePreviewLightbox.scss";
import React, { useCallback, useEffect } from "react";
import { XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown, open]);

  if (!src) return null;

  return (
    <div
      className={`s-image-preview${open ? "" : " s-image-preview--off"}`}
      role="presentation"
    >
      <div className="s-image-preview__backdrop" onClick={onClose} />
      <button
        type="button"
        className="s-image-preview__close"
        aria-label={t("common.close")}
        onClick={onClose}
      >
        <XIcon size={22} />
      </button>
      <div className="s-image-preview__stage" onClick={onClose}>
        <img
          className="s-image-preview__img"
          src={src}
          alt={alt ?? t("aimatch.ai.uploadedTicketAlt")}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImagePreviewLightbox;
