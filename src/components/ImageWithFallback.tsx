import React, { useEffect, useMemo, useState } from "react";
import { sanitizeRemoteImageUrl } from "../utils/imageUrl";
import { Image, View } from "@tarojs/components";
import type { ImageProps } from "@tarojs/components";

export type ImageWithFallbackProps = {
  src?: string;
  alt?: string;
  mode?: ImageProps["mode"];
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
  mode = "aspectFill",
}) => {
  const [broken, setBroken] = useState(false);
  const resolvedSrc = useMemo(() => sanitizeRemoteImageUrl(src), [src]);

  useEffect(() => {
    setBroken(false);
  }, [resolvedSrc]);

  const showImage = Boolean(resolvedSrc) && !broken;
  const isH5 = process.env.TARO_ENV === "h5";
  const imgLoading = isH5 && priority ? "eager" : undefined;
  const imgDecoding = isH5 && priority ? "sync" : undefined;
  const imgFetchPriority = isH5 && priority ? ("high" as const) : undefined;

  const renderImg = (className?: string) => (
    <Image
      src={resolvedSrc!}
      alt={alt}
      mode={mode}
      className={className}
      referrerPolicy={referrerPolicy}
      lazyLoad={!priority}
      {...(imgLoading ? { loading: imgLoading } : {})}
      {...(imgDecoding ? { decoding: imgDecoding } : {})}
      {...(imgFetchPriority ? { fetchPriority: imgFetchPriority } : {})}
      onError={() => setBroken(true)}
    />
  );

  if (wrapperClassName) {
    const wrapperClass = showImage
      ? wrapperClassName
      : (fallbackWrapperClassName ?? wrapperClassName);

    return (
      <View className={wrapperClass}>
        {showImage ? renderImg(imageClassName) : fallback}
      </View>
    );
  }

  if (showImage) {
    return renderImg(imageClassName);
  }

  return (
    <View
      className={placeholderClassName}
      aria-hidden={placeholderAriaHidden ? true : undefined}>
      {fallback}
    </View>
  );
};
