/**
 * 权益套餐总开关（默认关闭）。为 `true` 时启用：
 * - 个人页「我的权益」、权益页与套餐购买入口
 * - AI 匹配升级弹窗、活动页套餐购买、联系方式解锁升级提醒等
 */
export function isProfileBenefitsEnabled(): boolean {
  return process.env.TARO_APP_ENABLE_PROFILE_BENEFITS === 'true';
}
