import "./app.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import "./i18n";
import { createQueryClient } from "./utils/queryClient";

export default function App({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="s-app-shell">
        <div className="s-app-shell__viewport">{children}</div>
      </div>
    </QueryClientProvider>
  );
}
