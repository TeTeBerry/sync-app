import { createContext, useContext, type ReactNode } from 'react';

/** True when chat message list is fully expanded (not in compact preview). */
const ChatCollapseExpandedContext = createContext(true);

export function ChatCollapseExpandedProvider({
  expanded,
  children,
}: {
  expanded: boolean;
  children: ReactNode;
}) {
  return (
    <ChatCollapseExpandedContext.Provider value={expanded}>
      {children}
    </ChatCollapseExpandedContext.Provider>
  );
}

export function useChatCollapseExpanded(): boolean {
  return useContext(ChatCollapseExpandedContext);
}
