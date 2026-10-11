import AssignForm from "@/components/library/AssignForm";

export const metadata = { title: "Assign exercise · CoachSpace" };

export default async function AssignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  return <AssignForm exerciseId={id} editId={edit} />;
}
