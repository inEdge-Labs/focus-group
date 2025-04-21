import { Suspense } from "react";
import { SessionListSkeleton } from "@/components/session/session-list-skeleton";
import { SessionList } from "@/components/session/session-list";
import { CreateSessionButton } from "@/components/session/create-session";

export default async function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Focus Group Insights</h1>
        <CreateSessionButton />
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Focus Groups</h2>
          <Suspense fallback={<SessionListSkeleton />}>
            <SessionList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
