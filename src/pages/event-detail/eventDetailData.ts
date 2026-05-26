import { featuredEvents } from "../index/homeData";

export type EventTeamPost = {
  id: string;
  name: string;
  location: string;
  time: string;
  body: string;
  tags: string[];
  likes: number;
  comments: number;
  avatar: string;
  status: "招募中" | "已成团";
};

export type EventDetail = {
  id: number;
  title: string;
  date?: string;
  location?: string;
  posts: EventTeamPost[];
};

const postsByEventId: Record<number, EventTeamPost[]> = {
  1: [
    {
      id: "zara-tmr",
      name: "Zara",
      location: "上海",
      time: "1分钟前",
      body: "7月18日上海场，求组队！已有2人，还差1个女生～可以一起拼住宿，凌晨场一起出行！",
      tags: ["#住宿", "#上海", "#女生优先"],
      likes: 47,
      comments: 2,
      avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=120&q=80&fit=crop&crop=face",
      status: "招募中",
    },
    {
      id: "iris-tmr",
      name: "Iris",
      location: "上海",
      time: "3小时前",
      body: "上海场找队友！已有2人，还差1个女生～可以一起拼住宿，凌晨场一起出行！",
      tags: ["#组队", "#凌晨场", "#上海场"],
      likes: 18,
      comments: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&fit=crop&crop=face",
      status: "招募中",
    },
    {
      id: "wendy-tmr",
      name: "Wendy",
      location: "上海",
      time: "7小时前",
      body: "TMR上海！求最后一个住宿名额，女生优先，已有2人～",
      tags: ["#住宿", "#上海", "#女生"],
      likes: 12,
      comments: 1,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop&crop=face",
      status: "招募中",
    },
    {
      id: "maya-tmr",
      name: "Maya",
      location: "上海",
      time: "1天前",
      body: "队伍已满，感谢大家的申请！现场见～",
      tags: ["#已满员", "#上海"],
      likes: 8,
      comments: 0,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80&fit=crop&crop=face",
      status: "已成团",
    },
  ],
  2: [
    {
      id: "kyle-edc",
      name: "Kyle",
      location: "北京",
      time: "32分钟前",
      body: "北京站组队，3男1女，求最后一个小哥哥！已拼好套票+酒店，出发日期7月25日北京。",
      tags: ["#组队", "#北京", "#套票"],
      likes: 31,
      comments: 4,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80&fit=crop&crop=face",
      status: "招募中",
    },
    {
      id: "nova-edc",
      name: "Nova",
      location: "北京",
      time: "2小时前",
      body: "EDC北京站！求2个一起来的朋友，票我已经买好了，寻找同伴～",
      tags: ["#组队", "#北京"],
      likes: 24,
      comments: 3,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&fit=crop&crop=face",
      status: "招募中",
    },
  ],
};

export function getEventDetail(eventId: number): EventDetail | null {
  const event = featuredEvents.find((item) => item.id === eventId);
  if (!event) return null;

  return {
    id: event.id,
    title: event.title,
    date: event.date,
    location: event.venue,
    posts: postsByEventId[eventId] ?? [],
  };
}
