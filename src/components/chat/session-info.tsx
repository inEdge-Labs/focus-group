"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@/server/types";
import { getSession } from "@/server/crud";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionInfoProps {
  sessionId: string;
}

export function SessionInfo({ sessionId }: SessionInfoProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSession(sessionId);
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-destructive">
            Error: {error || "Session not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 pb-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{session.product_idea}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{session.theme}</Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users size={14} />
            <span>{session.personas.length}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
