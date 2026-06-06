import React, { useEffect, useMemo, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import {
  isWeappDownloadFileSuccess,
  needsWeappDownloadBeforeDisplay,
  resolveImageWithFallbackDisplaySrc,
  sanitizeRemoteImageUrl,
} from '../utils/imageUrl';
import { Image, View } from '@tarojs/components';
import type { ImageProps } from '@tarojs/components';

export type ImageWithFallbackProps = {
  src?: string;
  alt?: string;
  mode?: ImageProps['mode'];
  referrerPolicy?: 'no-referrer';
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
  alt = '',
  referrerPolicy = 'no-referrer',
  imageClassName,
  placeholderClassName,
  placeholderAriaHidden = true,
  fallback,
  wrapperClassName,
  fallbackWrapperClassName,
  priority = false,
  mode = 'aspectFill',
}) => {
  const [broken, setBroken] = useState(false);
  const [downloadedSrc, setDownloadedSrc] = useState<string | undefined>(undefined);
  const resolvedSrc = useMemo(() => sanitizeRemoteImageUrl(src), [src]);
  const needsDownload = useMemo(
    () => needsWeappDownloadBeforeDisplay(resolvedSrc),
    [resolvedSrc],
  );
  const displaySrc = useMemo(
    () => resolveImageWithFallbackDisplaySrc(resolvedSrc, downloadedSrc),
    [resolvedSrc, downloadedSrc],
  );
  const displaySrcRef = useRef(displaySrc);
  displaySrcRef.current = displaySrc;

  useEffect(() => {
    setBroken(false);

    if (!resolvedSrc?.trim() || !needsDownload) {
      setDownloadedSrc(undefined);
      return;
    }

    let cancelled = false;
    const downloadUrl = resolvedSrc.trim();
    void Taro.downloadFile({ url: downloadUrl })
      .then((res) => {
        if (cancelled) return;
        const tempPath = res.tempFilePath?.trim();
        if (isWeappDownloadFileSuccess(res) && tempPath) {
          setDownloadedSrc(tempPath);
          setBroken(false);
          return;
        }
        setDownloadedSrc(undefined);
        setBroken(true);
      })
      .catch(() => {
        if (!cancelled) {
          setDownloadedSrc(undefined);
          setBroken(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedSrc, needsDownload]);

  useEffect(() => {
    if (displaySrc?.trim()) {
      setBroken(false);
    }
  }, [displaySrc]);

  const showImage = Boolean(displaySrc?.trim()) && !broken;
  const isH5 = process.env.TARO_ENV === 'h5';
  const isWeapp = process.env.TARO_ENV === 'weapp';
  const imgLoading = isH5 && priority ? 'eager' : undefined;
  const imgDecoding = isH5 && priority ? 'sync' : undefined;
  const imgFetchPriority = isH5 && priority ? ('high' as const) : undefined;

  const handleImageError = () => {
    if (displaySrcRef.current !== displaySrc) return;
    setBroken(true);
  };

  const renderImg = (className?: string) => (
    <Image
      key={displaySrc}
      src={displaySrc!}
      alt={alt}
      mode={mode}
      className={className}
      {...(isH5 ? { referrerPolicy } : {})}
      lazyLoad={isWeapp ? false : !priority}
      {...(imgLoading ? { loading: imgLoading } : {})}
      {...(imgDecoding ? { decoding: imgDecoding } : {})}
      {...(imgFetchPriority ? { fetchPriority: imgFetchPriority } : {})}
      onError={handleImageError}
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
      aria-hidden={placeholderAriaHidden ? true : undefined}
    >
      {fallback}
    </View>
  );
};
