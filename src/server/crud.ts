"use client";
import {
  Session,
  Iteration,
  SessionAndIteration,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateIterationRequest,
} from "./types";
import { API_BASE_URL, getHeaders } from "./utils";

/**
 * Get all sessions for the current user
 */
export const getUserSessions = async (): Promise<Session[]> => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch sessions");
  }

  return response.json();
};

/**
 * Create a new session
 */
export const createSession = async (
  data: CreateSessionRequest,
): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create session");
  }

  return response.json();
};

/**
 * Update an existing session
 */
export const updateSession = async (
  sessionId: string,
  data: UpdateSessionRequest,
): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update session");
  }

  return response.json();
};

/**
 * Get a session by ID
 */
export const getSession = async (sessionId: string): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch session");
  }

  return response.json();
};

/**
 * Get all iterations for a session
 */
export const getSessionIterations = async (
  sessionId: string,
): Promise<Iteration[]> => {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/iterations`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch iterations");
  }

  return response.json();
};

/**
 * Create a new iteration (non-streaming)
 * Note: This endpoint might not be explicitly defined in the backend code
 */
export const createIteration = async (
  sessionId: string,
  data: CreateIterationRequest,
): Promise<Iteration> => {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/iterations`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create iteration");
  }

  return response.json();
};

/**
 * Cancel an in-progress streaming iteration
 */
export const cancelIteration = async (
  sessionId: string,
  iterationId: string,
): Promise<{ status: string; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/iterations/${iterationId}/cancel`,
    {
      method: "POST",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to cancel iteration");
  }

  return response.json();
};

/**
 * Get a session with all its iterations in a single request
 */
export const getSessionWithIterations = async (
  sessionId: string,
): Promise<SessionAndIteration> => {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/with-iterations`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "Failed to fetch session with iterations",
    );
  }

  return response.json();
};
