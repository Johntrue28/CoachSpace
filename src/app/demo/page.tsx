import DemoStudio from "@/components/demo/DemoStudio";

export const metadata = { title: "Demo Studio · CoachSpace", robots: { index: false } };

/** Presenter page for choosing a demo scenario (D-053). Reached from Settings → General or /demo. */
export default function DemoStudioPage() {
  return <DemoStudio />;
}
