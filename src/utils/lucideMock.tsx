import { View } from "@tarojs/components";
import type { FC } from "react";

const MockIcon: FC<Record<string, unknown>> = (props) => {
  const { size = 24, className, style, ...rest } = props as {
    size?: number | string;
    className?: string;
    style?: React.CSSProperties;
  };
  const s = typeof size === "number" ? `${size}px` : size;
  return (
    <View
      className={className}
      style={{
        width: s,
        height: s,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `calc(${s} * 0.75)`,
        color: "currentColor",
        ...style,
      }}
      {...rest}
    >
      ◆
    </View>
  );
};

export default MockIcon;

// --- Named exports (lucide-react-taro naming, no Icon suffix) ---
export const AudioWaveform = MockIcon;
export const Bell = MockIcon;
export const Calendar = MockIcon;
export const CalendarDays = MockIcon;
export const Check = MockIcon;
export const ChevronDown = MockIcon;
export const ChevronLeft = MockIcon;
export const ChevronRight = MockIcon;
export const ChevronUp = MockIcon;
export const CircleCheck = MockIcon;
export const Flame = MockIcon;
export const Globe = MockIcon;
export const Heart = MockIcon;
export const House = MockIcon;
export const Image = MockIcon;
export const ImagePlus = MockIcon;
export const Info = MockIcon;
export const LogOut = MockIcon;
export const Map = MockIcon;
export const MapPin = MockIcon;
export const Megaphone = MockIcon;
export const MessageCircle = MockIcon;
export const Search = MockIcon;
export const Send = MockIcon;
export const Settings = MockIcon;
export const Share2 = MockIcon;
export const Shield = MockIcon;
export const Sparkles = MockIcon;
export const ThumbsUp = MockIcon;
export const Ticket = MockIcon;
export const Trash2 = MockIcon;
export const TrendingUp = MockIcon;
export const User = MockIcon;
export const UserPlus = MockIcon;
export const Users = MockIcon;
export const X = MockIcon;
export const Zap = MockIcon;

// --- Legacy lucide-react naming (with Icon suffix) for backwards compat ---
export const AudioWaveformIcon = MockIcon;
export const BellIcon = MockIcon;
export const CalendarDaysIcon = MockIcon;
export const CalendarIcon = MockIcon;
export const CheckCircle2Icon = MockIcon;
export const CheckCircleIcon = MockIcon;
export const CheckIcon = MockIcon;
export const ChevronDownIcon = MockIcon;
export const ChevronLeftIcon = MockIcon;
export const ChevronRightIcon = MockIcon;
export const ChevronUpIcon = MockIcon;
export const ClockIcon = MockIcon;
export const FlameIcon = MockIcon;
export const GlobeIcon = MockIcon;
export const HeartIcon = MockIcon;
export const HelpCircleIcon = MockIcon;
export const HomeIcon = MockIcon;
export const ImageIcon = MockIcon;
export const ImagePlusIcon = MockIcon;
export const LogOutIcon = MockIcon;
export const MapIcon = MockIcon;
export const MapPinIcon = MockIcon;
export const MegaphoneIcon = MockIcon;
export const MessageCircleIcon = MockIcon;
export const MessageSquareIcon = MockIcon;
export const MoreVerticalIcon = MockIcon;
export const NotificationIcon = MockIcon;
export const PencilIcon = MockIcon;
export const SearchIcon = MockIcon;
export const SendIcon = MockIcon;
export const SettingsIcon = MockIcon;
export const ShieldIcon = MockIcon;
export const SparklesIcon = MockIcon;
export const ThumbsUpIcon = MockIcon;
export const TicketIcon = MockIcon;
export const Trash2Icon = MockIcon;
export const TrendingUpIcon = MockIcon;
export const UserIcon = MockIcon;
export const UserPlusIcon = MockIcon;
export const UsersIcon = MockIcon;
export const XIcon = MockIcon;
export const ZapIcon = MockIcon;
