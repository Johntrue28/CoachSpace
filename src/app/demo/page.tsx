import Welcome from "@/components/demo/Welcome";

export const metadata = {
  title: "Try CoachSpace with your sport",
  description: "An interactive demo of CoachSpace for tennis coaches, football academies and basketball clubs.",
};

/**
 * The welcome screen (D-055). New visitors to `/` are sent here first (see `scenarioBootScript`);
 * it is also linked from Settings → Demo.
 */
export default function WelcomePage() {
  return <Welcome />;
}
