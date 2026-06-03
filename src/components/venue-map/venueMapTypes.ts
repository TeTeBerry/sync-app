export type VenueMapMarker = {
  /** 0–1，相对场馆图宽度 */
  nx: number;
  /** 0–1，相对场馆图高度 */
  ny: number;
  label: string;
};

export type VenueMapMarkerPhase = 'idle' | 'naming' | 'placed';
