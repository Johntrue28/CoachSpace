import RoleSwitcher from "@/components/RoleSwitcher";
import ResetDemoButton from "@/components/ResetDemoButton";
import AttendanceSwitch from "@/components/attendance/AttendanceSwitch";
import Card from "@/components/ui/Card";
import MoreLinks from "@/components/shell/MoreLinks";

export const metadata = { title: "More · CoachSpace" };

/**
 * Secondary destinations of the coach view on mobile, plus the demo's features and settings.
 * The desktop sidebar links here for the features and demo settings.
 */
export default function MorePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">More</h1>
      <p className="mt-1 text-sm text-ink-soft">Everything else in your workspace.</p>

      <Card as="section" padded={false} className="mt-5 overflow-hidden">
        <MoreLinks />
      </Card>

      <Card as="section" className="mt-4" aria-labelledby="features-heading">
        <h2 id="features-heading" className="font-bold text-ink">
          Features
        </h2>
        <AttendanceSwitch className="mt-3" />
      </Card>

      <Card as="section" className="mt-4" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="sr-only">
          Demo
        </h2>
        <RoleSwitcher variant="panel" />
        <div className="mt-4 border-t border-line pt-4">
          <ResetDemoButton />
        </div>
      </Card>
    </main>
  );
}
