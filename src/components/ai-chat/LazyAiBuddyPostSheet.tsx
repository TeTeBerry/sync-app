import type { FC } from 'react';
import { useLazyComponent } from '@/hooks/useLazyComponent';
import type { AiBuddyPostSheetProps } from './AiBuddyPostSheet';

const loadAiBuddyPostSheet = () =>
  import('./AiBuddyPostSheet').then((mod) => ({
    default: mod.AiBuddyPostSheet,
  }));

export const LazyAiBuddyPostSheet: FC<AiBuddyPostSheetProps> = (props) => {
  const { Component } = useLazyComponent(loadAiBuddyPostSheet, 'default', props.open);

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
};
