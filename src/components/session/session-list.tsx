"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@/server/types";
import { getUserSessions } from "@/server/crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getUserSessions();
        // Ensure sessions is always an array, even if data is null or undefined
        setSessions(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load sessions",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error: {error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No focus groups yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first focus group to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl truncate">
                {session.product_idea}
              </CardTitle>
              <Badge variant="outline">{session.theme}</Badge>
            </div>
            <CardDescription>
              <div className="flex items-center gap-1 text-sm">
                <Users size={14} />
                <span>{session.personas.length} personas</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {session.personas.slice(0, 3).map((persona, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {persona.Name}
                  </Badge>
                ))}
                {session.personas.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{session.personas.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 border-t">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar size={14} className="mr-1" />
              {formatDistanceToNow(
                new Date(/*session.created_at ||*/ Date.now()),
                {
                  addSuffix: true,
                },
              )}
            </div>
            <Link href={`/sessions/${session.id}`}>
              <Button variant="default" size="sm">
                <MessageSquare size={16} className="mr-2" />
                Open Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
