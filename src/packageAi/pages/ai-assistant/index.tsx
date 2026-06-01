import { lazy, Suspense } from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';

const AiAssistantPage = lazy(() => import('./AiAssistantPage'));

export default function AiAssistantRoute() {
  return (
    <Suspense
      fallback={<ThemedPageLoader variant="skeleton-ai-chat" minHeight={400} />}
    >
      <AiAssistantPage />
    </Suspense>
  );
}
