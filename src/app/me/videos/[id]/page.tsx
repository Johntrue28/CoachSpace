import MyVideoDetail from "@/components/participant/MyVideoDetail";

export const metadata = { title: "Exercise · CoachSpace" };

export default async function MyVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MyVideoDetail id={id} />;
}
