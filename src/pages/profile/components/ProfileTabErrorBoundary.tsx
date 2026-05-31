import React, { Component, type ErrorInfo, type ReactNode } from "react";
import Taro from "@tarojs/taro";
import { Button, Text, View } from "@tarojs/components";

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
};

/** Prevents uncaught render errors from leaving the profile tab as a blank black screen. */
export class ProfileTabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Profile] render error", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="s-profile-error-fallback">
          <Text className="s-profile-error-fallback__title">页面加载异常</Text>
          <Text className="s-profile-error-fallback__hint">
            请重试；若仍无法打开，可重启小程序
          </Text>
          <Button
            className="s-profile-error-fallback__btn"
            onClick={() => {
              this.handleRetry();
              void Taro.showToast({ title: "已重试", icon: "none" });
            }}>
            <Text className="s-btn-label">重试</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
