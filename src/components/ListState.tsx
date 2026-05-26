import React from "react";

export type ListStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingText: string;
  errorText: string;
  emptyText: string;
  onRetry?: () => void;
  retryText?: string;
  stateClassName?: string;
  retryClassName?: string;
  children?: React.ReactNode;
};

export const ListState: React.FC<ListStateProps> = ({
  isLoading,
  isError,
  isEmpty,
  loadingText,
  errorText,
  emptyText,
  onRetry,
  retryText,
  stateClassName,
  retryClassName,
  children,
}) => {
  if (isLoading) {
    return <p className={stateClassName}>{loadingText}</p>;
  }

  if (isError) {
    return (
      <div className={stateClassName}>
        <p>{errorText}</p>
        {onRetry ? (
          <button type="button" className={retryClassName} onClick={() => void onRetry()}>
            {retryText}
          </button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return <p className={stateClassName}>{emptyText}</p>;
  }

  return children ?? null;
};
