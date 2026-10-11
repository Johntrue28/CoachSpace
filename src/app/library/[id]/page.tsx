import ExerciseDetail from "@/components/library/ExerciseDetail";

export const metadata = { title: "Exercise · CoachSpace" };

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExerciseDetail id={id} />;
}
