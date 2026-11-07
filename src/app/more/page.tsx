import RoleSwitcher from "@/components/RoleSwitcher";
import ResetDemoButton from "@/components/ResetDemoButton";
import AttendanceSwitch from "@/components/attendance/AttendanceSwitch";
import Card from "@/components/ui/Card";
import MoreLinks from "@/components/shell/MoreLinks";

export const metadata = { title: "Menu · CoachSpace" };

/**
 * The coach's menu on phones (opened from the avatar in the header, D-071): the secondary
 * destinations, the demo's features and the demo switch.
 */
export default function MorePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Menu</h1>

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
