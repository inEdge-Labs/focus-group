"use client";
import { useState, useCallback, useEffect, useRef } from "react";

// Define types for our response and controls
export type StreamingResponse = {
  fullContent: string;
  isComplete: boolean;
  iterationId: string | null;
  error: string | null;
};

export type StreamingControls = {
  cancel: () => Promise<void>;
};

/**
 * React hook for streaming chat communication
 */
export function useStreamingChat() {
  // State for the streaming response
  const [response, setResponse] = useState<StreamingResponse>({
    fullContent: "",
    isComplete: false,
    iterationId: null,
    error: null,
  });

  // Refs to track state between renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRef = useRef<boolean>(false);
  const fullContentRef = useRef<string>("");
  const iterationIdRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("Cleaning up stream");
    activeRef.current = false;

    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        console.error("Error aborting request:", e);
      }
      abortControllerRef.current = null;
    }
  }, []);

  // Effect for cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Get user ID from localStorage or use default
  const getUserId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("userId") || "user123";
    }
    return "user123";
  }, []);

  // Start streaming function
  const startStreaming = useCallback(
    (sessionId: string, message: string): StreamingControls => {
      console.log(`Creating iteration with message: ${message}`);

      // Clean up any existing stream
      cleanup();

      // Reset state
      fullContentRef.current = "";
      activeRef.current = true;
      iterationIdRef.current = null;

      setResponse({
        fullContent: "",
        isComplete: false,
        iterationId: null,
        error: null,
      });

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Define the cancel function that will be returned
      const cancelFunction = async () => {
        const iterationId = iterationIdRef.current;
        console.log("Cancelling iteration:", iterationId);

        if (iterationId) {
          try {
            await fetch(
              `http://localhost:8080/api/sessions/${sessionId}/iterations/${iterationId}/cancel`,
              {
                method: "POST",
                headers: {
                  "X-User-ID": getUserId(),
                },
              }
            );
          } catch (error) {
            console.error("Error cancelling iteration:", error);
          }
        }

        cleanup();

        // Mark as complete
        setResponse((prev) => ({
          ...prev,
          isComplete: true,
        }));
      };

      // Create the controls object that will be returned
      const controls: StreamingControls = {
        cancel: cancelFunction
      };

      // Set timeout for request (30 seconds)
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 30000);

      // Start fetching in the background
      (async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/sessions/${sessionId}/iterations/stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-User-ID": getUserId(),
                Accept: "text/event-stream",
              },
              body: JSON.stringify({
                message: { content: message },
              }),
              signal: abortControllerRef.current?.signal,
            }
          );

          // Clear the timeout
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response (${response.status}):`, errorText);
            throw new Error(`Server responded with status: ${response.status}`);
          }

          // Get a reader from the response body stream
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Response body is not readable");
          }

          // Create a TextDecoder for decoding the stream chunks
          const decoder = new TextDecoder();

          // Variables to track state
          let buffer = "";

          console.log("Stream connected, waiting for data...");

          // Process the stream
          while (activeRef.current) {
            const { value, done } = await reader.read();

            if (done) {
              console.log("Stream closed by server");
              break;
            }

            // Decode the received chunk and add to buffer
            const chunk = decoder.decode(value, { stream: true });
            console.log("Received chunk:", chunk);
            buffer += chunk;

            // Process any complete events in the buffer
            let eventStart = 0;
            let eventEnd = buffer.indexOf("\n\n", eventStart);

            while (eventEnd !== -1) {
              // Extract the event data
              const eventData = buffer.substring(eventStart, eventEnd);

              // Move the start pointer past this event
              eventStart = eventEnd + 2;

              // Process the event
              const eventLines = eventData.split("\n");
              let eventType = "";
              let eventContent = "";

              for (const line of eventLines) {
                if (line.startsWith("event:")) {
                  eventType = line.substring(6).trim();
                } else if (line.startsWith("data:")) {
                  eventContent = line.substring(5).trim();
                }
              }

              console.log(`Event type: ${eventType}, content: ${eventContent}`);

              if (eventType && eventContent) {
                try {
                  const data = JSON.parse(eventContent);

                  switch (eventType) {
                    case "start":
                      console.log("Started iteration:", data.id);
                      iterationIdRef.current = data.id;
                      setResponse((prev) => ({
                        ...prev,
                        iterationId: data.id,
                      }));
                      break;

                    case "update":
                      if (data.delta) {
                        console.log("Received delta update:", data.delta);
                        fullContentRef.current += data.delta;
                      } else if (data.content) {
                        console.log("Received full content update");
                        fullContentRef.current = data.content;
                      }

                      // Update the UI
                      setResponse((prev) => ({
                        ...prev,
                        fullContent: fullContentRef.current,
                      }));
                      break;

                    case "complete":
                      console.log("Completed iteration:", data);

                      // Use the complete content if provided
                      if (data.content && data.content.trim() !== "") {
                        fullContentRef.current = data.content;
                      }

                      // Mark as complete
                      setResponse({
                        fullContent: fullContentRef.current,
                        isComplete: true,
                        iterationId: iterationIdRef.current,
                        error: null,
                      });

                      // Clean up
                      cleanup();
                      return;

                    case "error":
                      throw new Error(
                        data.error || "Unknown error from server"
                      );
                  }
                } catch (e) {
                  console.error("Error processing event:", e, eventContent);
                }
              }

              // Look for the next event
              eventEnd = buffer.indexOf("\n\n", eventStart);
            }

            // Keep only the unprocessed part of the buffer
            if (eventStart > 0) {
              buffer = buffer.substring(eventStart);
            }

            // If buffer gets too large, trim it
            if (buffer.length > 100000) {
              console.warn("Buffer too large, trimming");
              buffer = buffer.substring(buffer.length - 10000);
            }
          }

          // If we get here without a complete event, finalize with what we have
          if (fullContentRef.current && activeRef.current) {
            setResponse({
              fullContent: fullContentRef.current,
              isComplete: true,
              iterationId: iterationIdRef.current,
              error: null,
            });
          }
        } catch (error) {
          console.error("Stream processing error:", error);

          // Only update state if we're still active
          if (activeRef.current) {
            setResponse((prev) => ({
              ...prev,
              error:
                error instanceof Error
                  ? error.message
                  : "Stream processing error",
              isComplete: true,
            }));
          }

          cleanup();
        }
      })();

      // Return controls immediately
      return controls;
    },
    [cleanup, getUserId]
  );

  return { response, startStreaming };
}
