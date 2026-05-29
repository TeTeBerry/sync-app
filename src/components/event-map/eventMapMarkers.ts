import { picsumUrl } from "../../utils/imageUrl";

export const EVENT_MAP_DEFAULT_TITLE = "风暴电音节 深圳站";
export const EVENT_MAP_DEFAULT_DATE_RANGE = "Sun 3/10 - Sun 3/24";

export type EventMapMarker = {
  name: string;
  shortName?: string;
  /** 后端 demo / 真实用户 id，用于拉取 TA 的帖子 */
  userId: string;
  /** 与后端 authorName 对齐，用于 owner 过滤 */
  authorName: string;
  ring: string;
  ringClass: string;
  avatarSeed: string;
  nx: number;
  ny: number;
  badge?: "等待队友" | "组队中";
  star?: boolean;
  bottomBadge?: "plane";
};

export const EVENT_MAP_MARKERS: EventMapMarker[] = [
  {
    name: "Christopher",
    shortName: "Chris",
    userId: "demo-sean",
    authorName: "Sean",
    ring: "#ff4d8d",
    ringClass: "s-event-map__bottom-avatar--pink",
    avatarSeed: "sync-map-christopher",
    nx: 0.28,
    ny: 0.36,
    star: true,
  },
  {
    name: "Luna",
    userId: "demo-luna",
    authorName: "Luna",
    ring: "#3dd9f5",
    ringClass: "s-event-map__bottom-avatar--cyan",
    avatarSeed: "sync-map-luna",
    nx: 0.14,
    ny: 0.48,
  },
  {
    name: "Makenzie",
    userId: "demo-mia",
    authorName: "Mia",
    ring: "#ff4d8d",
    ringClass: "s-event-map__bottom-avatar--grey",
    avatarSeed: "sync-map-makenzie",
    nx: 0.42,
    ny: 0.3,
  },
  {
    name: "Jestin",
    shortName: "Jestin",
    userId: "demo-ryan",
    authorName: "Ryan",
    ring: "#3dd9f5",
    ringClass: "s-event-map__bottom-avatar--cyan",
    avatarSeed: "sync-map-jestin",
    nx: 0.62,
    ny: 0.38,
  },
  {
    name: "Bry",
    userId: "demo-alex",
    authorName: "Alex",
    ring: "#4ade80",
    ringClass: "s-event-map__bottom-avatar--green",
    avatarSeed: "sync-map-bry",
    nx: 0.22,
    ny: 0.58,
  },
  {
    name: "Nick",
    userId: "demo-sam",
    authorName: "Sam",
    ring: "#a78bfa",
    ringClass: "s-event-map__bottom-avatar--purple",
    avatarSeed: "sync-map-nick",
    nx: 0.48,
    ny: 0.56,
  },
  {
    name: "Bianca",
    shortName: "Bianca",
    userId: "demo-jade",
    authorName: "Jade",
    ring: "#f7e018",
    ringClass: "s-event-map__bottom-avatar--yellow",
    avatarSeed: "sync-map-bianca",
    nx: 0.72,
    ny: 0.5,
    badge: "等待队友",
  },
  {
    name: "Ariel",
    shortName: "Ariel",
    userId: "demo-nova-storm",
    authorName: "Nova",
    ring: "#a78bfa",
    ringClass: "s-event-map__bottom-avatar--purple",
    avatarSeed: "sync-map-ariel",
    nx: 0.78,
    ny: 0.62,
    badge: "组队中",
  },
];

export const EVENT_MAP_BOTTOM_ROW: EventMapMarker[] = [
  EVENT_MAP_MARKERS[0],
  EVENT_MAP_MARKERS[6],
  EVENT_MAP_MARKERS[3],
  EVENT_MAP_MARKERS[2],
  EVENT_MAP_MARKERS[7],
];

export function markerAvatarUrl(seed: string, size = 96): string {
  return picsumUrl(seed, size, size);
}
