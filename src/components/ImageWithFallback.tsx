import React, { useEffect, useState } from "react";

export type ImageWithFallbackProps = {
  src?: string;
  alt?: string;
  referrerPolicy?: "no-referrer";
  imageClassName?: string;
  placeholderClassName?: string;
  placeholderAriaHidden?: boolean;
  fallback: React.ReactNode;
  wrapperClassName?: string;
  fallbackWrapperClassName?: string;
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "",
  referrerPolicy = "no-referrer",
  imageClassName,
  placeholderClassName,
  placeholderAriaHidden = true,
  fallback,
  wrapperClassName,
  fallbackWrapperClassName,
}) => {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const showImage = Boolean(src) && !broken;

  if (wrapperClassName) {
    const wrapperClass = showImage
      ? wrapperClassName
      : (fallbackWrapperClassName ?? wrapperClassName);

    return (
      <div className={wrapperClass}>
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className={imageClassName}
            referrerPolicy={referrerPolicy}
            onError={() => setBroken(true)}
          />
        ) : (
          fallback
        )}
      </div>
    );
  }

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={imageClassName}
        referrerPolicy={referrerPolicy}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div
      className={placeholderClassName}
      aria-hidden={placeholderAriaHidden ? true : undefined}
    >
      {fallback}
    </div>
  );
};
