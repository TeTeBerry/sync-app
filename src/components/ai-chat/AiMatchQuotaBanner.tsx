import './AiMatchQuotaBanner.scss';
import { Zap } from 'lucide-react-taro';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import { useAiMatchQuotaExhausted } from '../../hooks/useAiMatchQuotaExhausted';
import { useAiUpgradeSheet } from './AiUpgradeSheetContext';

export function AiMatchQuotaBanner() {
  const exhausted = useAiMatchQuotaExhausted();
  const { openUpgradeSheet } = useAiUpgradeSheet();

  if (!exhausted) return null;

  return (
    <View className="s-ai-match-quota-banner" role="status">
      <View className="s-ai-match-quota-banner__main">
        <Zap size={16} className="s-ai-match-quota-banner__icon" aria-hidden />
        <Text className="s-ai-match-quota-banner__text">
          AI 匹配次数已用完 · 升级套餐继续使用
        </Text>
      </View>
      <Button
        className="s-ai-match-quota-banner__cta"
        aria-label="升级套餐"
        onClick={openUpgradeSheet}
      >
        <Text className="s-btn-label">升级</Text>
      </Button>
    </View>
  );
}
