import type { FC } from 'react';
import { useLazyComponent } from '@/hooks/useLazyComponent';
import type { ArtistProfileSheetProps } from './ArtistProfileSheet';

const loadArtistProfileSheet = () =>
  import('./ArtistProfileSheet').then((mod) => ({
    default: mod.ArtistProfileSheet,
  }));

export const LazyArtistProfileSheet: FC<ArtistProfileSheetProps> = (props) => {
  const enabled = props.open || Boolean(props.artistId?.trim());
  const { Component } = useLazyComponent(loadArtistProfileSheet, 'default', enabled);

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
};
