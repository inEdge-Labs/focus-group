// Persona type definitions
export interface Persona {
  Name: string;
  Age: number;
  Occupation: string;
  Traits: string[];
  Background: string;
  Interests: string[];
  Concerns: string[];
  SpeakingStyle: string;
}

// Session type definitions
export interface Session {
  id: string;
  user_id: string;
  personas: Persona[];
  product_idea: string;
  theme: string;
}

// Message type from LLM
export interface Message {
  role: "user" | "assistant";
  content: string;
}

// Iteration type
export interface Iteration {
  id: string;
  session_id: string;
  message: Message;
}

// Combined session and iterations
export interface SessionAndIteration {
  session: Session;
  iterations: Iteration[];
}

// Request types
export interface CreateSessionRequest {
  personas: Persona[];
  product_idea: string;
  theme: string;
}

export interface UpdateSessionRequest {
  personas: Persona[];
  product_idea: string;
  theme: string;
}

export interface CreateIterationRequest {
  message: {
    content: string;
  };
}

// Streaming event types
export type EventType = "start" | "update" | "complete" | "error";

export interface StartEventData {
  id: string;
  status: "started";
}

export interface UpdateEventData {
  delta: string;
}

export interface CompleteEventData {
  id: string;
  status: "completed";
  content: string;
}

export interface ErrorEventData {
  error: string;
}

// Additional types for SSE events
export interface SSEEvent<T> {
  type: EventType;
  data: T;
}

export type SSEEventData =
  | StartEventData
  | UpdateEventData
  | CompleteEventData
  | ErrorEventData;

export interface StreamingResponse {
  fullContent: string;
  isComplete: boolean;
  iterationId: string | null;
  error: string | null;
}

export interface StreamingControls {
  cancel: () => Promise<void>;
}
