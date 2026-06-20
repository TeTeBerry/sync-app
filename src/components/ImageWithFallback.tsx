import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  resolveImageWithFallbackDisplaySrc,
  sanitizeRemoteImageUrl,
} from '../utils/imageUrl';
import { Image, View } from '@tarojs/components';
import type { ImageProps } from '@tarojs/components';
import './ImageWithFallback.scss';

export type ImageWithFallbackProps = {
  src?: string;
  alt?: string;
  mode?: ImageProps['mode'];
  referrerPolicy?: 'no-referrer';
  imageClassName?: string;
  placeholderClassName?: string;
  placeholderAriaHidden?: boolean;
  fallback: React.ReactNode;
  /** Shown while loading; defaults to `fallback`. */
  loadingFallback?: React.ReactNode;
  wrapperClassName?: string;
  fallbackWrapperClassName?: string;
  /** LCP / hero images: eager load + high fetch priority */
  priority?: boolean;
  /** Keep fallback visible until `onLoad` (reduces layout pop-in). */
  placeholderUntilLoaded?: boolean;
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  referrerPolicy = 'no-referrer',
  imageClassName,
  placeholderClassName,
  placeholderAriaHidden = true,
  fallback,
  loadingFallback,
  wrapperClassName,
  fallbackWrapperClassName,
  priority = false,
  placeholderUntilLoaded = false,
  mode = 'aspectFill',
}) => {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolvedSrc = useMemo(() => sanitizeRemoteImageUrl(src), [src]);
  const displaySrc = useMemo(
    () => resolveImageWithFallbackDisplaySrc(resolvedSrc),
    [resolvedSrc],
  );
  const displaySrcRef = useRef(displaySrc);
  displaySrcRef.current = displaySrc;
  const pendingPlaceholder = loadingFallback ?? fallback;

  useEffect(() => {
    setBroken(false);
    setLoaded(false);
  }, [displaySrc]);

  const showImage = Boolean(displaySrc?.trim()) && !broken;
  const showLoadingPlaceholder =
    placeholderUntilLoaded && showImage && !loaded && !broken;
  const isH5 = process.env.TARO_ENV === 'h5';
  const imgLoading = isH5 && priority ? 'eager' : undefined;
  const imgDecoding = isH5 && priority ? 'sync' : undefined;
  const imgFetchPriority = isH5 && priority ? ('high' as const) : undefined;

  const handleImageError = () => {
    if (displaySrcRef.current !== displaySrc) return;
    setBroken(true);
  };

  const handleImageLoad = () => {
    if (displaySrcRef.current !== displaySrc) return;
    setLoaded(true);
  };

  const imageClassNames = [
    imageClassName,
    placeholderUntilLoaded && !loaded ? 's-image-with-fallback__img--pending' : '',
    placeholderUntilLoaded && loaded ? 's-image-with-fallback__img--loaded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderImg = (className?: string) => (
    <Image
      key={displaySrc}
      src={displaySrc!}
      alt={alt}
      mode={mode}
      className={className}
      {...(isH5 ? { referrerPolicy } : {})}
      lazyLoad={!priority}
      {...(imgLoading ? { loading: imgLoading } : {})}
      {...(imgDecoding ? { decoding: imgDecoding } : {})}
      {...(imgFetchPriority ? { fetchPriority: imgFetchPriority } : {})}
      onLoad={placeholderUntilLoaded ? handleImageLoad : undefined}
      onError={handleImageError}
    />
  );

  if (wrapperClassName) {
    const wrapperClass = showImage
      ? [
          wrapperClassName,
          showLoadingPlaceholder ? 's-image-with-fallback--loading' : '',
        ]
          .filter(Boolean)
          .join(' ')
      : (fallbackWrapperClassName ?? wrapperClassName);

    return (
      <View className={wrapperClass}>
        {showImage ? (
          <>
            {showLoadingPlaceholder ? (
              <View className="s-image-with-fallback__placeholder" aria-hidden>
                {pendingPlaceholder}
              </View>
            ) : null}
            {renderImg(imageClassNames)}
          </>
        ) : (
          pendingPlaceholder
        )}
      </View>
    );
  }

  if (showImage) {
    if (!placeholderUntilLoaded) {
      return renderImg(imageClassName);
    }

    return (
      <View
        className={['s-image-with-fallback--loading', placeholderClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {showLoadingPlaceholder ? (
          <View className="s-image-with-fallback__placeholder" aria-hidden>
            {pendingPlaceholder}
          </View>
        ) : null}
        {renderImg(imageClassNames)}
      </View>
    );
  }

  return (
    <View
      className={placeholderClassName}
      aria-hidden={placeholderAriaHidden ? true : undefined}
    >
      {pendingPlaceholder}
    </View>
  );
};
