import { FirebaseError } from "@firebase/app";

const knownAuthErrors: Record<string, string> = {
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed":
    "Google sign-in is not enabled for this Firebase project.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in window. Allow pop-ups and try again.",
  "auth/popup-closed-by-user": "The sign-in window was closed before completion.",
  "auth/unauthorized-domain":
    "This website domain is not authorized in Firebase Authentication settings.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && knownAuthErrors[error.code]) {
    return knownAuthErrors[error.code];
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}
