"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";

export function AuthRequired({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main
        aria-label="Checking sign-in status"
        className="mx-auto w-full max-w-6xl animate-pulse px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="h-9 w-64 rounded bg-stone-100" />
        <div className="mt-3 h-5 w-80 max-w-full rounded bg-stone-100" />
        <div className="mt-9 h-64 rounded-xl border border-stone-200 bg-stone-50" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <section className="mx-auto w-full max-w-lg rounded-xl border border-amber-300 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Private learning space
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Sign in to continue
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            This learning content is available after you sign in.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            href="/login"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
