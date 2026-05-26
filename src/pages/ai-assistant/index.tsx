import { lazy, Suspense } from "react";
import PageLoadingFallback from "../../components/PageLoadingFallback";

const AiAssistantPage = lazy(() => import("../../components/AiAssistantPage"));

export default function AiAssistantRoute() {
  return (
    <Suspense fallback={<PageLoadingFallback minHeight={480} />}>
      <AiAssistantPage />
    </Suspense>
  );
}
