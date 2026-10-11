import AssignForm from "@/components/library/AssignForm";

export const metadata = { title: "Assign exercise · CoachSpace" };

export default async function AssignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { id } = await params;
  const { group } = await searchParams;
  return <AssignForm exerciseId={id} focusGroupId={group} />;
}
