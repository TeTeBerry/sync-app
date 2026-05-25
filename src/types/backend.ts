export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface BackendActivity {
  _id: string;
  legacyId: number;
  name: string;
  code: string;
  alias?: string[];
  date?: string;
  location?: string;
  image?: string;
  hot?: boolean;
  attendees?: number;
  pinCount?: number;
}

export interface BackendTicket {
  _id: string;
  activityId?: string;
  userId?: string;
  userName?: string;
  skuCode?: string;
  status?: string;
  seatOrSlot?: {
    type?: "sell" | "buy";
    quantity?: number;
    price?: number;
    eventDate?: string;
    contact?: string;
    displayEventName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendPindanInclude {
  kind: "hotel" | "transport";
  title: string;
  detail: string;
}

export interface BackendPindan {
  _id: string;
  legacyId?: number;
  title: string;
  subtitle?: string;
  type?: "package" | "hotel" | "transport";
  activityId?: string;
  activityLegacyId?: number;
  leaderUserId?: string;
  memberUserIds?: string[];
  status?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  date?: string;
  location?: string;
  joined?: number;
  total?: number;
  tags?: string[];
  rating?: number;
  includes?: BackendPindanInclude[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTicketPayload {
  activityId: string;
  quantity: number;
  type: "sell" | "buy";
  skuCode: string;
  price: number;
  eventDate: string;
  contact: string;
  userId?: string;
  userName?: string;
  displayEventName?: string;
}

export interface ProfileTicketItem {
  id: string;
  type: "sell" | "buy";
  activityId: string;
  skuCode: string;
  quantity: number;
  price: number;
  eventDate: string;
  contact: string;
  createdAt: string;
}

export interface HomeSummary {
  heat: {
    people: number;
    pinOrders: number;
    growthPercent: number;
  };
  signupEvents: Array<{
    id: number;
    title: string;
    date: string;
    location: string;
    image: string;
    category: string;
    hot: boolean;
    attendees: number;
    pinCount: number;
    going: boolean;
  }>;
  hotPins: Array<{
    id: number;
    rank: number;
    title: string;
    badge: string;
    category: string;
    categoryTone: "primary" | "amber" | "cyan";
    people: number;
    pinType: "package" | "hotel" | "transport";
    pinItemId: number;
  }>;
  ticketListings: Array<{
    id: string | number;
    type: "sell" | "buy";
    event: string;
    seat: string;
    price: number;
    originalPrice: number;
    seller: string;
    avatar: string;
    tag: string;
    tone: "primary" | "secondary" | "amber" | "cyan";
    time: string;
    verified: boolean;
  }>;
}

export interface ProfilePinDanItem {
  id: number;
  activityId: number;
  category: "package" | "hotel" | "transport";
  title: string;
  subtitle: string;
  date: string;
  location: string;
  price: number;
  image: string;
  joinedAt: string;
}
