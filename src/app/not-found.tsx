import NotFoundView from "@/components/errors/NotFoundView";

export const metadata = { title: "Page not found · CoachSpace" };

/** A link that leads nowhere: back into the demo (D-069). The words follow the interface language (D-083). */
export default function NotFound() {
  return <NotFoundView />;
}
