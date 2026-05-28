import { useState, useCallback } from "react";
import { Image } from "lucide-react-taro";
import ImagePreviewLightbox from "./ImagePreviewLightbox";
import "./PostImageGrid.scss";
import { Button, Image as TaroImage, Text, View } from '@tarojs/components';

export interface PostImageGridProps {
  images: string[];
  maxDisplay?: number;
  fullBleed?: boolean;
}

export function PostImageGrid({ images, maxDisplay = 6, fullBleed = false }: PostImageGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const validImages = images.filter(Boolean).slice(0, maxDisplay);
  if (!validImages.length) return null;

  const count = validImages.length;
  const hasFeatured = count >= 4; // 4张及以上：首图突出 + 缩略图行

  const handleOpen = useCallback((index: number) => {
    setPreviewIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  const bleedClass = fullBleed ? "s-post-image-grid--full-bleed" : "";

  // 1-3张：统一网格布局
  if (count <= 3) {
    const gridClass =
      count === 1
        ? "s-post-image-grid--1"
        : count === 2
          ? "s-post-image-grid--2"
          : "s-post-image-grid--3";

    return (
      <>
        <View className={`s-post-image-grid ${gridClass} ${bleedClass}`}>
          {validImages.map((src, index) => (
            <Button
              key={`${src.slice(0, 40)}-${index}`}
              type="button"
              className="s-post-image-grid__item"
              onClick={() => handleOpen(index)}
              aria-label={`查看图片 ${index + 1}`}
            >
              <TaroImage src={src} className="s-post-image-grid__img" />
            </Button>
          ))}
        </View>
        <ImagePreviewLightbox
          open={previewIndex !== null}
          src={previewIndex !== null ? validImages[previewIndex] : null}
          onClose={handleClose}
        />
      </>
    );
  }

  // 4-6张：首图突出 + 缩略图行（截图样式）
  const featured = validImages[0];
  const thumbnails = validImages.slice(1);

  return (
    <>
      <View className={`s-post-image-grid s-post-image-grid--featured ${bleedClass}`}>
        {/* 首图大图 */}
        <Button
          type="button"
          className="s-post-image-grid__featured"
          onClick={() => handleOpen(0)}
          aria-label="查看图片 1"
        >
          <TaroImage src={featured} className="s-post-image-grid__img" />
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
              type="button"
              className="s-post-image-grid__thumb"
              onClick={() => handleOpen(index + 1)}
              aria-label={`查看图片 ${index + 2}`}
            >
              <TaroImage src={src} className="s-post-image-grid__img" />
              {index === thumbnails.length - 1 && images.length > maxDisplay ? (
                <Text className="s-post-image-grid__more">
                  +{images.length - maxDisplay}
                </Text>
              ) : null}
            </Button>
          ))}
        </View>
      </View>

      <ImagePreviewLightbox
        open={previewIndex !== null}
        src={previewIndex !== null ? validImages[previewIndex] : null}
        onClose={handleClose}
      />
    </>
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
