import ExerciseDetail from "@/components/library/ExerciseDetail";

export const metadata = { title: "Exercise · CoachSpace" };

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  return <ExerciseDetail id={id} saved={saved} />;
}
