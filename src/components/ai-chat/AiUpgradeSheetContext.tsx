import React, { createContext, useContext } from 'react';

export type AiUpgradeSheetContextValue = {
  openUpgradeSheet: () => void;
};

const AiUpgradeSheetContext = createContext<AiUpgradeSheetContextValue | null>(null);

export function AiUpgradeSheetProvider({
  openUpgradeSheet,
  children,
}: {
  openUpgradeSheet: () => void;
  children: React.ReactNode;
}) {
  return (
    <AiUpgradeSheetContext.Provider value={{ openUpgradeSheet }}>
      {children}
    </AiUpgradeSheetContext.Provider>
  );
}

export function useAiUpgradeSheet(): AiUpgradeSheetContextValue {
  const ctx = useContext(AiUpgradeSheetContext);
  if (!ctx) {
    throw new Error('useAiUpgradeSheet must be used within AiUpgradeSheetProvider');
  }
  return ctx;
}
