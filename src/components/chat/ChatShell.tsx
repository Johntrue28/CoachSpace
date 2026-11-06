"use client";

import { usePathname } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ConversationList from "./ConversationList";
import MessagesTabs from "@/components/messages/MessagesTabs";

/**
 * Chat layout (Figma Chat, D-049). From 1024 px the conversation list and the open conversation
 * sit side by side in one card; on smaller screens the list and each conversation are separate
 * pages, as before. The routes do not change: /chat lists, /chat/<id> opens a conversation.
 */
export default function ChatShell({
  viewerId,
  basePath,
  description,
  children,
}: {
  viewerId?: string;
  basePath: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isList = pathname === basePath;
  return (
    <main className="mx-auto w-full max-w-screen-2xl lg:px-9 lg:pt-8">
      <div className={`px-4 pt-6 sm:px-6 lg:px-0 lg:pt-0 ${isList ? "" : "hidden lg:block"}`}>
        <PageHeader title="Messages" description={description} titleAs={isList ? "h1" : "p"} />
        <MessagesTabs active="chats" participant={basePath.startsWith("/me")} className="mt-4 lg:mb-0" />
      </div>
      <div className="lg:mt-6 lg:grid lg:h-[calc(100dvh-var(--shell-header-h)-11rem)] lg:min-h-[30rem] lg:grid-cols-[20rem_minmax(0,1fr)] lg:overflow-hidden lg:rounded-card lg:bg-card lg:shadow-card lg:ring-1 lg:ring-line xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className={`${isList ? "block" : "hidden lg:block"} min-w-0 lg:overflow-y-auto lg:border-r lg:border-line`}>
          <ConversationList viewerId={viewerId} basePath={basePath} />
        </div>
        <div className={`${isList ? "hidden lg:flex" : "flex"} min-w-0 flex-col lg:min-h-0`}>{children}</div>
      </div>
    </main>
  );
}
