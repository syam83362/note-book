import { getApp, getApps, initializeApp, type FirebaseOptions } from "@firebase/app";
import { getAuth } from "@firebase/auth";

const requiredEnvironmentVariables = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const;

export function getFirebaseConfigError(): string | null {
  const missingVariables = [
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ? null
      : requiredEnvironmentVariables.apiKey,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      ? null
      : requiredEnvironmentVariables.authDomain,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? null
      : requiredEnvironmentVariables.projectId,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      ? null
      : requiredEnvironmentVariables.appId,
  ].filter((environmentVariable) => environmentVariable !== null);

  if (missingVariables.length > 0) {
    return `Firebase is not configured. Add ${missingVariables.join(", ")} to .env.local and restart the development server.`;
  }

  return null;
}

function getFirebaseConfig(): FirebaseOptions {
  const configurationError = getFirebaseConfigError();

  if (configurationError) {
    throw new Error(configurationError);
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
}

export function getFirebaseApp() {
  return getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
