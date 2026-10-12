import SessionDetail from "@/components/calendar/SessionDetail";

export const metadata = { title: "Session · CoachSpace" };

/** Sessions are checked in the browser: they depend on the date, the scenario and saved changes. */
export function generateStaticParams() {
  return [];
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionDetail id={id} />;
}
