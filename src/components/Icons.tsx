type P = { className?: string };
const base = "h-6 w-6";
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

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
