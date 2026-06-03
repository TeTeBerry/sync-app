import { Text } from '@tarojs/components';

type OnSiteVerifiedBadgeProps = {
  className?: string;
};

/**「我在现场」— 与现场资讯 feed 认证标识样式一致 */
export function OnSiteVerifiedBadge({ className }: OnSiteVerifiedBadgeProps) {
  return (
    <Text
      className={['s-live-info-post__cert-pill', className].filter(Boolean).join(' ')}
    >
      我在现场
    </Text>
  );
}
