type P = { className?: string };
const base = "h-6 w-6";
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const HomeIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /></svg>
);
export const UsersIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2" /></svg>
);
export const ChatIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M4 5h16v11H9l-5 4z" /></svg>
);
export const CalendarIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const VideoIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10.5 5-3v9l-5-3" /></svg>
);
export const PinIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const MegaphoneIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M3 10v4h4l8 4V6L7 10z" /><path d="M19 9.5a3.5 3.5 0 0 1 0 5" /></svg>
);
export const ChevronRightIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronLeftIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="m15 6-6 6 6 6" /></svg>
);
export const ArrowLeftIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const SearchIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);
export const ClockIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const BookIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg>
);
export const PlusIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M12 5v14M5 12h14" /></svg>
);
export const PlayIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5.5 3.5-5.5 3.5z" /></svg>
);
export const DeviceIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><rect x="6.5" y="2.5" width="11" height="19" rx="2" /><path d="M11 18.5h2" /></svg>
);
export const SendIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M4 12 20 4l-4 16-4-6.5z" /><path d="m12 13.5 8-9.5" /></svg>
);
export const CheckIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const AlertIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
);
export const BellIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15 18 8.5" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></svg>
);
export const UserCheckIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5 1.5 0 2.8.4 3.9 1.1" /><path d="m15.5 17.5 2 2 4-4.5" /></svg>
);
export const MenuIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const LogoMark = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 7.5a6.4 6.4 0 1 0 9 9" /><path d="m14 8 3 3 4-5" /></svg>
);
export const SettingsIcon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.07 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></svg>
);
