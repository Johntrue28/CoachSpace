import SessionForm from "@/components/calendar/SessionForm";

export const metadata = { title: "Change session · CoachSpace" };

/** Sessions are checked in the browser: they depend on the date, the scenario and saved changes. */
export function generateStaticParams() {
  return [];
}

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionForm sessionId={id} />;
}
