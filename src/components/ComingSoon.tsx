import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <main className="px-4 pt-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <EmptyState
        className="mt-6 bg-card"
        icon={<Badge tone="attention">Coming soon</Badge>}
        description={description}
        action={
          <ButtonLink href="/" variant="ghost" size="sm">
            Back to home
          </ButtonLink>
        }
      />
    </main>
  );
}
