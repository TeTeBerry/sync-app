import './AiGuideResultCard.scss';
import { RefreshCw, Share2 } from '../../components/icons';
import { Button } from '../ui';
import { openSingleImagePreview } from '../../utils/openImagePreview';
import { Image, Text, View } from '@tarojs/components';

export type AiGuideResultCardProps = {
  imagePath: string;
  disabled?: boolean;
  onRegenerate: () => void;
  onShare: () => void;
};

export function AiGuideResultCard({
  imagePath,
  disabled = false,
  onRegenerate,
  onShare,
}: AiGuideResultCardProps) {
  return (
    <View className="s-ai-guide-result">
      <Button
        className="s-ai-guide-result__image-btn"
        disabled={disabled}
        aria-label="查看攻略大图"
        onClick={() => void openSingleImagePreview(imagePath)}
      >
        <Image className="s-ai-guide-result__image" src={imagePath} mode="widthFix" />
      </Button>
      <View className="s-ai-guide-result__actions">
        <Button
          className="s-ai-guide-result__action"
          disabled={disabled}
          hoverClass="s-ai-guide-result__action--pressed"
          onClick={onRegenerate}
        >
          <RefreshCw size={16} color="#fff" />
          <Text className="s-ai-guide-result__action-label">重新生成</Text>
        </Button>
        <Button
          className="s-ai-guide-result__action s-ai-guide-result__action--primary"
          disabled={disabled}
          hoverClass="s-ai-guide-result__action--pressed"
          onClick={onShare}
        >
          <Share2 size={16} color="#fff" />
          <Text className="s-ai-guide-result__action-label">分享给朋友</Text>
        </Button>
      </View>
    </View>
  );
}
