// API base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Helper function to get user ID
export const getUserId = (): string => {
  // Replace with your actual method to retrieve the user ID
  // Example: return from localStorage, auth context, etc.
  return "user123";
};

// Common headers for all requests
export const getHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  "X-User-ID": getUserId(),
});
