import ExerciseForm from "@/components/library/ExerciseForm";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

/** The demo exercises of every scenario are built in advance; exercises added in the browser are built on request. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.exercises.map((e) => e.id));
}

export const metadata = { title: "Edit exercise · CoachSpace" };

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExerciseForm exerciseId={id} />;
}
