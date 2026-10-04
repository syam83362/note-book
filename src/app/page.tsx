import Link from "next/link";
import { learningAreas } from "@/lib/learning-areas";
import { HomeAction } from "@/components/dashboard/home-action";

export default function Home() {
  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            A private learning space
          </p>
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
            Learn together.
            <br />
            <span className="underline decoration-amber-300 decoration-[6px] underline-offset-[7px]">
              Build what&apos;s next.
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            DevLearn is a shared workspace for exploring DevOps, DevSecOps, and
            AI. Keep useful notes in one place and make learning a team habit.
          </p>
          <HomeAction />
        </div>
      </section>

      <section
        aria-labelledby="areas-heading"
        className="border-y border-stone-200 bg-stone-50/70"
        id="learning-areas"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-stone-500">
                Learn at your own pace, together
              </p>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl"
                id="areas-heading"
              >
                Three areas to explore
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-stone-600">
              A focused starting point for shared notes and practical learning.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {learningAreas.map((area) => (
              <Link
                aria-label={`Open ${area.title} topics`}
                className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
                href={`/dashboard/${area.id}`}
                key={area.id}
              >
                <article className="flex min-h-64 flex-col rounded-xl border border-amber-300 bg-white p-5 transition-colors hover:bg-amber-50/30 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.12em] text-stone-500">
                      AREA {area.number}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-amber-400"
                    />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-stone-950">
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
                    Open {area.title} topics →
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="flex flex-col gap-5 rounded-xl border border-amber-300 bg-amber-50/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              A shared place for what you learn
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
              Collect explanations, examples, and useful references so the
              whole group can build on them.
            </p>
          </div>
          <span className="shrink-0 self-start rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 sm:self-auto">
            Made for your learning group
          </span>
        </div>
      </section>
    </main>
  );
}
