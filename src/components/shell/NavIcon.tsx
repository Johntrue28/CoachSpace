import {
  BookIcon,
  CalendarIcon,
  ChatIcon,
  HomeIcon,
  MegaphoneIcon,
  MenuIcon,
  UserCheckIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/Icons";
import type { IconKey } from "./sections";

const icons: Record<IconKey, (props: { className?: string }) => React.ReactElement> = {
  home: HomeIcon,
  calendar: CalendarIcon,
  groups: UsersIcon,
  library: BookIcon,
  chat: ChatIcon,
  announcements: MegaphoneIcon,
  attendance: UserCheckIcon,
  video: VideoIcon,
  more: MenuIcon,
};

/** The icon of a navigation item. */
export default function NavIcon({ icon, className }: { icon: IconKey; className?: string }) {
  const Icon = icons[icon];
  return <Icon className={className} />;
}
