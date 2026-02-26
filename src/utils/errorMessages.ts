/**
 * Error message catalog — maps known error codes and patterns to
 * user-friendly messages shown via Alert or toast.
 */

import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/requires-recent-login": "Please sign in again to continue.",
};

const FUNCTIONS_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "You don't have permission to perform this action.",
  "unauthenticated": "Your session has expired. Please sign in again.",
  "not-found": "The requested resource was not found.",
  "already-exists": "This record already exists.",
  "resource-exhausted": "You've reached your usage limit. Please upgrade your plan.",
  "unavailable": "The service is temporarily unavailable. Please try again shortly.",
  "deadline-exceeded": "The request timed out. Please try again.",
  "internal": "An unexpected server error occurred. Please try again.",
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

/**
 * Converts any caught error into a user-friendly message string.
 *
 * Usage:
 *   } catch (err) {
 *     Alert.alert("Error", getErrorMessage(err));
 *   }
 */
export function getErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred.";

  // Firebase errors (Auth + Functions callable)
  if (isFirebaseError(err)) {
    const authMsg = FIREBASE_AUTH_MESSAGES[err.code];
    if (authMsg) return authMsg;

    const fnMsg = FUNCTIONS_ERROR_MESSAGES[err.code];
    if (fnMsg) return fnMsg;
  }

  // Axios errors
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status && status >= 500) return "A server error occurred. Please try again shortly.";
    if (!err.response) return "Network error. Please check your connection and try again.";
  }

  if (err instanceof Error) {
    const msg = err.message;
    if (msg.length < 200 && !msg.includes("at ")) return msg;
  }

  return "An unexpected error occurred. Please try again.";
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

interface FirebaseError {
  code: string;
  message: string;
}

function isFirebaseError(err: unknown): err is FirebaseError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as FirebaseError).code === "string"
  );
}

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in err &&
    (err as AxiosError).isAxiosError === true
  );
}
