import { useCallback, useMemo } from 'react';
import { ImageIcon } from '../../components/icons';
import './PostImageGrid.scss';
import {
  featuredPostImageUrl,
  sanitizeRemoteImageUrl,
  thumbnailImageUrl,
} from '../../utils/imageUrl';
import { openImagePreview } from '../../utils/openImagePreview';
import { ImageWithFallback } from '../ImageWithFallback';
import { View } from '@tarojs/components';

export interface PostImageGridProps {
  images: string[];
  maxDisplay?: number;
}

const THUMB_ROW_WIDTH = 200;
const FEATURED_WIDTH = 480;

export function PostImageGrid({ images, maxDisplay = 4 }: PostImageGridProps) {
  const validImages = useMemo(
    () =>
      images
        .map((src) => sanitizeRemoteImageUrl(src) ?? src)
        .filter(Boolean)
        .slice(0, maxDisplay),
    [images, maxDisplay],
  );
  const displayImages = useMemo(
    () =>
      validImages.map((src, index) => {
        if (index === 0 && validImages.length >= 4) {
          return featuredPostImageUrl(src, FEATURED_WIDTH) ?? src;
        }
        return thumbnailImageUrl(src, THUMB_ROW_WIDTH) ?? src;
      }),
    [validImages],
  );

  const handleOpen = useCallback(
    (index: number) => {
      void openImagePreview(validImages, index);
    },
    [validImages],
  );

  if (!validImages.length) return null;

  const count = validImages.length;

  const renderImage = (
    src: string,
    className: string,
    priority = false,
    mode: 'aspectFill' | 'widthFix' = 'aspectFill',
  ) => (
    <ImageWithFallback
      src={src}
      imageClassName={className}
      placeholderClassName={`${className} s-post-image-grid__img--placeholder`}
      fallback=""
      priority={priority}
      mode={mode}
    />
  );

  const renderTile = (
    index: number,
    className: string,
    ariaLabel: string,
    priority = false,
  ) => (
    <View
      key={`post-img-${index}`}
      className={className}
      onClick={() => handleOpen(index)}
      aria-label={ariaLabel}
      role="button"
    >
      {renderImage(displayImages[index], 's-post-image-grid__img', priority)}
    </View>
  );

  // 单图：widthFix 适配小程序（避免 aspect-ratio 失效导致错位）
  if (count === 1) {
    return (
      <View className="s-post-image-grid s-post-image-grid--1">
        <View
          className="s-post-image-grid__item s-post-image-grid__item--width-fix"
          onClick={() => handleOpen(0)}
          aria-label="查看图片 1"
          role="button"
        >
          {renderImage(
            displayImages[0],
            's-post-image-grid__img s-post-image-grid__img--width-fix',
            true,
            'widthFix',
          )}
        </View>
      </View>
    );
  }

  // 2-3 张：网格布局
  if (count <= 3) {
    const gridClass = count === 2 ? 's-post-image-grid--2' : 's-post-image-grid--3';

    return (
      <View className={`s-post-image-grid ${gridClass}`}>
        {displayImages.map((_, index) =>
          renderTile(
            index,
            's-post-image-grid__item',
            `查看图片 ${index + 1}`,
            index === 0,
          ),
        )}
      </View>
    );
  }

  // 4-6张：首图突出 + 缩略图行（截图样式）
  const thumbnails = displayImages.slice(1);

  return (
    <View className="s-post-image-grid s-post-image-grid--featured">
      <View
        className="s-post-image-grid__featured"
        onClick={() => handleOpen(0)}
        aria-label="查看图片 1"
        role="button"
      >
        {renderImage(displayImages[0], 's-post-image-grid__img', true)}
        <View className="s-post-image-grid__count-badge">
          <ImageIcon size={14} />
          {images.length}
        </View>
      </View>

      <View className="s-post-image-grid__thumbs">
        {thumbnails.map((_, thumbIndex) => {
          const index = thumbIndex + 1;
          return (
            <View
              key={`post-img-${index}`}
              className="s-post-image-grid__thumb"
              onClick={() => handleOpen(index)}
              aria-label={`查看图片 ${index + 1}`}
              role="button"
            >
              {renderImage(displayImages[index], 's-post-image-grid__img')}
              {thumbIndex === thumbnails.length - 1 && images.length > maxDisplay ? (
                <View className="s-post-image-grid__more">
                  +{images.length - maxDisplay}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
