"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export function ProfileContent() {
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  if (!user) {
    return null;
  }

  const displayName = user.displayName || "Learner";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
        <Link className="hover:text-stone-900" href="/dashboard">
          Dashboard
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <span aria-current="page" className="font-medium text-stone-800">
          Profile
        </span>
      </nav>
      <section className="mt-7 rounded-xl border border-amber-300 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          Your account
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          Profile
        </h1>
        <div className="mt-7 flex items-center gap-4">
          {user.photoURL && !imageFailed ? (
            <Image
              alt=""
              aria-hidden="true"
              className="h-16 w-16 rounded-full border border-stone-200 object-cover"
              height={64}
              onError={() => setImageFailed(true)}
              src={user.photoURL}
              unoptimized
              width={64}
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-lg font-semibold text-stone-700">
              {initials || "L"}
            </span>
          )}
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              {displayName}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {user.email || "No email provided"}
            </p>
          </div>
        </div>
        <dl className="mt-8 grid gap-4 border-t border-stone-200 pt-6 sm:grid-cols-[9rem_1fr]">
          <dt className="text-sm font-medium text-stone-500">
            Firebase UID
          </dt>
          <dd className="break-all rounded-md bg-stone-50 px-3 py-2 font-mono text-xs leading-5 text-stone-700">
            {user.uid}
          </dd>
          <dt className="text-sm font-medium text-stone-500">
            Sign-in provider
          </dt>
          <dd className="text-sm text-stone-700">
            {user.providerData.map((provider) => provider.providerId).join(", ")}
          </dd>
        </dl>
        <p className="mt-5 text-sm leading-6 text-stone-600">
          To enable access to shared learning data, add your UID to the local
          <code> data/users.json</code> allowlist. Editing is available only
          when running this application locally in development.
        </p>
      </section>
    </main>
  );
}
