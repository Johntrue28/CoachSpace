import ExerciseDetail from "@/components/library/ExerciseDetail";
import { paramsFromAllScenarios } from "@/data/scenarios/all";

/** The demo exercises of every scenario are built in advance; exercises added in the browser are built on request. */
export function generateStaticParams() {
  return paramsFromAllScenarios((s) => s.exercises.map((e) => e.id));
}

export const metadata = { title: "Exercise · CoachSpace" };

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExerciseDetail id={id} />;
}
