import './AiGuideResultCard.scss';
import { RefreshCw, Share2, Users } from '../../components/icons';
import { Button } from '../ui';
import { openSingleImagePreview } from '../../utils/openImagePreview';
import { Image, Text, View } from '@tarojs/components';

export type AiGuideResultCardProps = {
  imagePath: string;
  disabled?: boolean;
  onRegenerate: () => void;
  onShare: () => void;
  onBuddyPostFromGuide?: () => void;
};

export function AiGuideResultCard({
  imagePath,
  disabled = false,
  onRegenerate,
  onShare,
  onBuddyPostFromGuide,
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
      {onBuddyPostFromGuide ? (
        <Button
          className="s-ai-guide-result__buddy-cta"
          disabled={disabled}
          hoverClass="s-ai-guide-result__buddy-cta--pressed"
          onClick={onBuddyPostFromGuide}
        >
          <Users size={18} color="#fff" />
          <View className="s-ai-guide-result__buddy-cta-text">
            <Text className="s-ai-guide-result__buddy-cta-title">一键组队</Text>
            <Text className="s-ai-guide-result__buddy-cta-sub">
              用攻略里的出发地、人数预填发帖
            </Text>
          </View>
        </Button>
      ) : null}
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
