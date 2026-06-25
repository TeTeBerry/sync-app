import type { FC } from 'react';
import { useLazyComponent } from '@/hooks/useLazyComponent';
import type { AiGuidePlanSheetProps } from './AiGuidePlanSheet';

const loadAiGuidePlanSheet = () =>
  import('./AiGuidePlanSheet').then((mod) => ({
    default: mod.AiGuidePlanSheet,
  }));

export const LazyAiGuidePlanSheet: FC<AiGuidePlanSheetProps> = (props) => {
  const { Component } = useLazyComponent(loadAiGuidePlanSheet, 'default', props.open);

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
};
