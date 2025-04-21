import { Suspense } from "react";
import { ChatSession } from "@/components/chat/session";
import { SessionInfo } from "@/components/chat/session-info";
import { ChatSessionSkeleton } from "@/components/session/chat-session-skeleton";

interface SessionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  // Await the params promise to get the actual values
  const { id } = await params;

  return (
    <main className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-2rem)]">
      <Suspense fallback={<ChatSessionSkeleton />}>
        <SessionInfo sessionId={id} />
        <ChatSession sessionId={id} />
      </Suspense>
    </main>
  );
}
