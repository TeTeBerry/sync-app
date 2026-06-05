export type ExploreUserStatus = 'onsite' | 'want' | 'pulse';

export type ExploreMapUser = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: ExploreUserStatus;
  /** Pulse 小字气泡文案 */
  pulseText?: string;
  isSelf?: boolean;
};

export type MapRegionBounds = {
  northeast: { latitude: number; longitude: number };
  southwest: { latitude: number; longitude: number };
};
