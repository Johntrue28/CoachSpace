import { ChatIcon } from "@/components/Icons";
import EmptyState from "@/components/ui/EmptyState";

/** The right-hand side of the chat from 1024 px before a conversation is opened. */
export default function NoConversation() {
  return (
    <div className="grid flex-1 place-items-center bg-canvas p-8">
      <EmptyState
        className="max-w-sm border-0 bg-transparent"
        icon={<ChatIcon className="h-5 w-5" />}
        title="Choose a conversation"
        description="Select a group chat or a one-to-one conversation from the list."
      />
    </div>
  );
}
