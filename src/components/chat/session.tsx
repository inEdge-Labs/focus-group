"use client";

import { useEffect, useRef, useState } from "react";
import { useStreamingChat } from "@/hooks/use-streaming";
import { getSessionIterations } from "@/server/crud";
import type { Iteration, Message } from "@/server/types";
import { ChatInput } from "./input";
import { ChatMessage } from "./message";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChatSessionProps {
  sessionId: string;
}

export function ChatSession({ sessionId }: ChatSessionProps) {
const [iterations, setIterations] = useState<Iteration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { response, startStreaming } = useStreamingChat();
  console.log("response:", response);
  const [streamingControls, setStreamingControls] = useState<{
    cancel: () => Promise<void>;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchIterations = async () => {
      try {
        const data = await getSessionIterations(sessionId);

        setIterations(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load chat history",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchIterations();
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [iterations, response.fullContent]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create a temporary user message
    const userMessage: Message = {
      role: "user",
      content,
    };

    // Add user message to UI immediately
    const userIteration: Iteration = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      message: userMessage,
    };

setIterations((prev) => prev ? [...prev, userIteration] : [userIteration]);

    // Start streaming the AI response
    const controls = startStreaming(sessionId, content);
    setStreamingControls(controls);
  };

  const handleCancelResponse = async () => {
    if (streamingControls) {
      await streamingControls.cancel();
      setStreamingControls(null);
      toast("The AI response has been cancelled");
    }
  };

  useEffect(() => {
    // When streaming is complete, add the response to iterations
    if (response.isComplete && response.fullContent && response.iterationId) {
      const assistantMessage: Message = {
        role: "assistant",
        content: response.fullContent,
      };

      const assistantIteration: Iteration = {
        id: response.iterationId,
        session_id: sessionId,
        message: assistantMessage,
      };

      setIterations((prev) => {
        // Check if we already have this iteration
        if (prev.some((it) => it.id === response.iterationId)) {
          return prev;
        }
        return [...prev, assistantIteration];
      });

      setStreamingControls(null);
    }
  }, [response, sessionId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
{iterations && iterations.map((iteration) => (
        <ChatMessage key={iteration.id} message={iteration.message} />
      ))}

        {/* Streaming response */}
        {response.fullContent && !response.isComplete && (
          <ChatMessage
            message={{
              role: "assistant",
              content: response.fullContent,
            }}
            isStreaming={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={!!streamingControls}
          onCancelStreaming={handleCancelResponse}
        />
      </div>
    </div>
  );
}
