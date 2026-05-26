import "./app.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import "./i18n";

export default function App({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="s-app-shell">
        <div className="s-app-shell__viewport">{children}</div>
      </div>
    </QueryClientProvider>
  );
}
