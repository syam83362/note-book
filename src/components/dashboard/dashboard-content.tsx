"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { learningAreas } from "@/lib/learning-areas";

function LearningAreaCard({
  area,
}: {
  area: (typeof learningAreas)[number];
}) {
  const card = (
    <article
      aria-labelledby={`${area.id}-heading`}
      className="flex min-h-72 flex-col rounded-xl border border-amber-300 bg-white p-5 transition-colors hover:bg-amber-50/30 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.12em] text-stone-500">
          AREA {area.number}
        </span>
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-amber-400"
        />
      </div>
      <h3
        className="mt-6 text-xl font-semibold text-stone-950"
        id={`${area.id}-heading`}
      >
        {area.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        {area.description}
      </p>
      <ul
        aria-label={`${area.title} example topics`}
        className="mt-auto flex flex-wrap gap-2 pt-6"
      >
        {area.topics.map((topic) => (
          <li
            className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
            key={topic}
          >
            {topic}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-stone-100 pt-4 text-xs font-medium text-stone-500">
        Browse {area.title} topics →
      </p>
    </article>
  );

  return (
    <Link
      aria-label={`Open ${area.title} topics`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
      href={`/dashboard/${area.id}`}
    >
      {card}
    </Link>
  );
}

export function DashboardContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main
        aria-label="Loading dashboard"
        className="mx-auto w-full max-w-6xl animate-pulse px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="h-9 w-64 rounded bg-stone-100" />
        <div className="mt-3 h-5 w-80 max-w-full rounded bg-stone-100" />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {learningAreas.map((area) => (
            <div
              className="h-64 rounded-xl border border-stone-200 bg-stone-50"
              key={area.id}
            />
          ))}
        </div>
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
            Sign in to view your dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Your learning areas are available after you sign in.
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

  const firstName =
    user.displayName?.trim().split(/\s+/)[0] || "Learner";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <section aria-labelledby="dashboard-heading">
        <p className="text-sm font-medium text-stone-500">
          Your private learning space
        </p>
        <h1
          className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl"
          id="dashboard-heading"
        >
          Welcome, {firstName}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Choose an area to explore. Your group&apos;s notes are read from local
          JSON files.
        </p>
      </section>

      <section aria-labelledby="areas-heading" className="mt-10 sm:mt-12">
        <div className="mb-6">
          <h2
            className="text-xl font-semibold tracking-tight text-stone-950"
            id="areas-heading"
          >
            Learning areas
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Three focused spaces to start learning together.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {learningAreas.map((area) => (
            <LearningAreaCard area={area} key={area.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
