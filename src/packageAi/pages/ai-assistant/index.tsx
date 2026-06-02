import AiAssistantPage from './AiAssistantPage';

/** 同步加载，避免从活动页「生成攻略」进入时长时间停在 Suspense 骨架屏 */
export default function AiAssistantRoute() {
  return <AiAssistantPage />;
}
