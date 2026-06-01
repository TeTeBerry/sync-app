import './PageLoadingFallback.scss';
import { Text, View } from '@tarojs/components';

type PageLoadingFallbackProps = {
  /** Reserve vertical space to reduce layout shift */
  minHeight?: number;
};

export default function PageLoadingFallback({
  minHeight = 120,
}: PageLoadingFallbackProps) {
  return (
    <View
      className="s-page-loading"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Text className="s-page-loading__dot" />
      <Text className="s-page-loading__dot" />
      <Text className="s-page-loading__dot" />
    </View>
  );
}
