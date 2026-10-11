import ExerciseForm from "@/components/library/ExerciseForm";

export const metadata = { title: "Edit exercise · CoachSpace" };

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExerciseForm exerciseId={id} />;
}
