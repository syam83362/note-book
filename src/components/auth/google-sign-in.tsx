"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error";
import { useAuth } from "./auth-provider";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
      <path
        d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.4Z"
        fill="#4285F4"
      />
      <path
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z"
        fill="#34A853"
      />
      <path
        d="M12.8 27.6a12 12 0 0 1 0-7.2v-5.3H5.9a20 20 0 0 0 0 17.8l6.9-5.3Z"
        fill="#FBBC05"
      />
      <path
        d="M24 12.2c3 0 5.6 1 7.7 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 15.1l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignIn() {
  const { user, loading, initializationError, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);

    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError));
    } finally {
      setSigningIn(false);
    }
  }

  if (loading) {
    return (
      <div
        aria-label="Checking sign-in status"
        className="h-12 w-full animate-pulse rounded-lg bg-stone-100"
      />
    );
  }

  if (user) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="font-medium text-stone-900">
          You&apos;re signed in as {user.displayName || user.email}.
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          onClick={() => router.replace("/dashboard")}
          type="button"
        >
          Continue to DevLearn
        </button>
      </div>
    );
  }

  const configurationMessage = initializationError
    ? `Sign-in is not configured yet. ${initializationError}`
    : null;
  const errorMessage = configurationMessage || error;

  return (
    <>
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-wait disabled:opacity-60"
        disabled={Boolean(configurationMessage) || signingIn}
        onClick={handleSignIn}
        type="button"
      >
        <GoogleMark />
        {signingIn ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {errorMessage && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <p className="mt-5 text-center text-xs leading-5 text-stone-500">
        Sign-in is currently limited by the Firebase project&apos;s
        authentication settings.
      </p>
    </>
  );
}
