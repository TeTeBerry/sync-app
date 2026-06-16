export type ProfileDisplayUser = {
  name: string;
  handle: string;
  location: string;
  bio: string;
  avatar: string;
  verified: boolean;
  stats: {
    events: number;
    posts: number;
  };
};

export const EMPTY_PROFILE_DISPLAY_USER: ProfileDisplayUser = {
  name: '用户',
  handle: '',
  location: '',
  bio: '',
  avatar: '',
  verified: false,
  stats: { events: 0, posts: 0 },
};
