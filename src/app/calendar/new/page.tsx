import SessionForm from "@/components/calendar/SessionForm";

export const metadata = { title: "New session · CoachSpace" };

export default async function NewSessionPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  return <SessionForm defaultDate={date} />;
}
