"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, StopCircle } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  onCancelStreaming: () => void;
}

export function ChatInput({
  onSendMessage,
  isStreaming,
  onCancelStreaming,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isStreaming) {
      onSendMessage(message);
      setMessage("");

      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="min-h-[60px] resize-none"
        disabled={isStreaming}
      />
      {isStreaming ? (
        <Button
          variant="destructive"
          size="icon"
          onClick={onCancelStreaming}
          className="h-[60px]"
        >
          <StopCircle className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
          className="h-[60px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
