import type { Message } from "@/server/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto" : "mr-auto")}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg p-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <div className="whitespace-pre-wrap">
          {message.content}
          {isStreaming && (
            <Loader2 className="inline-block ml-1 h-3 w-3 animate-spin" />
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
