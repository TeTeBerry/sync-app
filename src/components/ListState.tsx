import React from "react";
import { Button, Text, View } from '@tarojs/components';

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
    return <Text className={stateClassName}>{loadingText}</Text>;
  }

  if (isError) {
    return (
      <View className={stateClassName}>
        <Text>{errorText}</Text>
        {onRetry ? (
          <Button type="button" className={retryClassName} onClick={() => void onRetry()}>
            {retryText}
          </Button>
        ) : null}
      </View>
    );
  }

  if (isEmpty) {
    return <Text className={stateClassName}>{emptyText}</Text>;
  }

  return children ?? null;
};
