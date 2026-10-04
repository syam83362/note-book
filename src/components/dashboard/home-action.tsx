"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export function HomeAction() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <span
        aria-label="Checking sign-in status"
        className="mt-8 inline-flex h-12 w-48 animate-pulse rounded-lg bg-stone-100"
      />
    );
  }

  return (
    <Link
      className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      href={user ? "/dashboard" : "/login"}
    >
      {user ? "Open your dashboard" : "Sign in to DevLearn"}
      <span aria-hidden="true" className="ml-2 text-amber-300">
        →
      </span>
    </Link>
  );
}
