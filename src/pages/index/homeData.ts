export type CountdownPart = {
  value: string;
  unit: string;
  accent?: boolean;
};

export type { FeaturedEvent } from "../../utils/apiMappers";

export type ActivityPost = {
  id: string;
  userId?: string;
  name: string;
  handle: string;
  event: string;
  location: string;
  body: string;
  time: string;
  likes: number;
  liked?: boolean;
  comments: number;
  avatar: string;
  status: "招募中" | "已组队" | "已隐藏";
};
