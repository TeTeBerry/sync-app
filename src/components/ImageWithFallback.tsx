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
  /** LCP / hero images: eager load + high fetch priority */
  priority?: boolean;
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
  priority = false,
}) => {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const showImage = Boolean(src) && !broken;
  const imgLoading = priority ? "eager" : "lazy";
  const imgDecoding = priority ? "sync" : "async";
  const imgFetchPriority = priority ? ("high" as const) : undefined;

  const renderImg = (className?: string) => (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
      loading={imgLoading}
      decoding={imgDecoding}
      {...(imgFetchPriority ? { fetchPriority: imgFetchPriority } : {})}
      onError={() => setBroken(true)}
    />
  );

  if (wrapperClassName) {
    const wrapperClass = showImage
      ? wrapperClassName
      : (fallbackWrapperClassName ?? wrapperClassName);

    return (
      <div className={wrapperClass}>
        {showImage ? renderImg(imageClassName) : fallback}
      </div>
    );
  }

  if (showImage) {
    return renderImg(imageClassName);
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
