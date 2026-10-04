"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error";
import { useAuth } from "./auth-provider";

function ProfileAvatar({
  photoUrl,
  displayName,
}: {
  photoUrl: string | null;
  displayName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (photoUrl && !imageFailed) {
    return (
      <Image
        alt=""
        aria-hidden="true"
        className="h-8 w-8 shrink-0 rounded-full border border-stone-200 object-cover sm:h-9 sm:w-9"
        height={36}
        onError={() => setImageFailed(true)}
        src={photoUrl}
        unoptimized
        width={36}
      />
    );
  }

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-xs font-semibold text-stone-700 sm:h-9 sm:w-9 sm:text-sm"
    >
      {initials || "L"}
    </span>
  );
}

export function AuthNavigation() {
  const { user, loading, initializationError, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(getAuthErrorMessage(error));
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <span aria-label="Checking sign-in status" className="h-9 w-24 animate-pulse rounded-lg bg-stone-100" />
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          href="/login"
        >
          Sign in
        </Link>
        {initializationError && (
          <span className="sr-only" role="status">
            Sign-in is unavailable: {initializationError}
          </span>
        )}
      </div>
    );
  }

  const displayName = user.displayName || user.email || "Learner";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <Link
        className="min-h-10 shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:px-3 sm:text-sm"
        href="/dashboard"
      >
        Dashboard
      </Link>
      <Link
        aria-label="View profile"
        className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:gap-2.5"
        href="/profile"
      >
        <ProfileAvatar displayName={displayName} photoUrl={user.photoURL} />
        <span className="max-w-14 truncate text-xs font-medium text-stone-700 sm:max-w-36 sm:text-sm">
          {displayName}
        </span>
      </Link>
      <button
        className="min-h-10 shrink-0 rounded-lg border border-stone-300 px-2.5 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-wait disabled:opacity-60 sm:px-3 sm:text-sm"
        disabled={signingOut}
        onClick={handleSignOut}
        type="button"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
      {signOutError && (
        <span className="sr-only" role="alert">
          Sign-out failed: {signOutError}
        </span>
      )}
    </div>
  );
}
