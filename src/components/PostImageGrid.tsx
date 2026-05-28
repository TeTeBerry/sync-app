import { useCallback, useMemo } from "react";
import { Image } from "lucide-react-taro";
import "./PostImageGrid.scss";
import { sanitizeRemoteImageUrl, thumbnailImageUrl } from "../utils/imageUrl";
import { openImagePreview } from "../utils/openImagePreview";
import { Button, Image as TaroImage, Text, View } from '@tarojs/components';

export interface PostImageGridProps {
  images: string[];
  maxDisplay?: number;
}

const LIST_THUMB_WIDTH = 480;
const THUMB_ROW_WIDTH = 200;

export function PostImageGrid({ images, maxDisplay = 6 }: PostImageGridProps) {
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
        const width = index === 0 && validImages.length >= 4 ? LIST_THUMB_WIDTH : THUMB_ROW_WIDTH;
        return thumbnailImageUrl(src, width) ?? src;
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

  const renderImage = (src: string, className: string) => (
    <TaroImage src={src} className={className} mode="aspectFill" lazyLoad />
  );

  // 1-3张：统一网格布局
  if (count <= 3) {
    const gridClass =
      count === 1
        ? "s-post-image-grid--1"
        : count === 2
          ? "s-post-image-grid--2"
          : "s-post-image-grid--3";

    return (
      <View className={`s-post-image-grid ${gridClass}`}>
        {displayImages.map((src, index) => (
          <Button
            key={`${src.slice(0, 40)}-${index}`}
            className="s-post-image-grid__item"
            onClick={() => handleOpen(index)}
            aria-label={`查看图片 ${index + 1}`}>
            {renderImage(src, "s-post-image-grid__img")}
          </Button>
        ))}
      </View>
    );
  }

  // 4-6张：首图突出 + 缩略图行（截图样式）
  const featured = displayImages[0];
  const thumbnails = displayImages.slice(1);

  return (
    <View className="s-post-image-grid s-post-image-grid--featured">
      {/* 首图大图 */}
      <Button className="s-post-image-grid__featured"
        onClick={() => handleOpen(0)}
        aria-label="查看图片 1">
        {renderImage(featured, "s-post-image-grid__img")}
        <Text className="s-post-image-grid__count-badge">
          <Image size={14} />
          {images.length}
        </Text>
      </Button>

      {/* 缩略图行 */}
      <View className="s-post-image-grid__thumbs">
        {thumbnails.map((src, index) => (
          <Button
            key={`${src.slice(0, 40)}-${index + 1}`}
            className="s-post-image-grid__thumb"
            onClick={() => handleOpen(index + 1)}
            aria-label={`查看图片 ${index + 2}`}>
            {renderImage(src, "s-post-image-grid__img")}
            {index === thumbnails.length - 1 && images.length> maxDisplay ? (
              <Text className="s-post-image-grid__more">
                +{images.length - maxDisplay}
              </Text>
            ) : null}
          </Button>
        ))}
      </View>
    </View>
  );
}

export function PostImageCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Text className="s-post-image-count">
      <Image size={12} />
      {count}
    </Text>
  );
}
