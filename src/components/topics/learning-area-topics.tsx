"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createTopic, listTopics } from "@/lib/data/client";
import { learningAreas } from "@/lib/learning-areas";
import type { LearningAreaId, LearningTopic } from "@/lib/data/types";
import { ProfileStack } from "@/components/topics/profile-stack";

export function LearningAreaTopics({ areaId }: { areaId: LearningAreaId }) {
  const area = learningAreas.find((item) => item.id === areaId)!;
  const { user } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const canEdit = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      try {
        const data = await listTopics(user, areaId);
        if (active) {
          setTopics(data);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load topics.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 4000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [areaId, user]);

  async function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !title.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const result = await createTopic(user, areaId, title, description);
      router.push(`/dashboard/${areaId}/topics/${result.id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create topic.");
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
        <Link className="hover:text-stone-900" href="/dashboard">Dashboard</Link>
        <span aria-hidden="true" className="px-2">/</span>
        <span aria-current="page" className="font-medium text-stone-800">{area.title}</span>
      </nav>

      <section aria-labelledby="area-heading" className="mt-7">
        <p className="text-sm font-medium text-stone-500">Learning area {area.number}</p>
        <h1
          className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl"
          id="area-heading"
        >
          {area.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">{area.description}</p>
      </section>

      <section aria-labelledby="topics-heading" className="mt-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-stone-950" id="topics-heading">
            {areaId === "devops" ? "Shared notes" : "Topics"}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {areaId === "devops"
              ? "Examples and notes contributed by your learning group."
              : "Browse notes stored in JSON files in the project."}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {topics.map((topic) => (
            <Link
              className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
              href={`/dashboard/${areaId}/topics/${topic.id}`}
              key={topic.id}
            >
              <article className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 transition-colors group-hover:border-amber-300 group-hover:bg-amber-50/30 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.12em] text-stone-500">TEAM NOTES</span>
                  <span aria-hidden="true" className="text-lg text-amber-600">→</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-stone-950">{topic.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {topic.description || "Shared notes for your learning group."}
                </p>
                <div className="mt-auto border-t border-stone-100 pt-4">
                  <ProfileStack userIds={topic.contributorIds} />
                  <p className="mt-2 text-xs font-medium text-stone-500">
                    Updated {new Date(topic.updatedAt).toLocaleString()}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {loading && !error && <p className="mt-5 text-sm text-stone-500" role="status">Loading notes…</p>}
        {!loading && !error && topics.length === 0 && (
          <p className="mt-5 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-600">
            No shared notes yet. Create one below to get the conversation started.
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800" role="alert">
            {error}
          </p>
        )}

        {canEdit ? (
          <details className="mt-8 max-w-2xl rounded-xl border border-stone-200 bg-stone-50">
            <summary className="cursor-pointer list-none rounded-xl p-5 text-sm font-semibold text-stone-800 marker:content-none hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:px-6">
              <span className="flex items-center justify-between">
                Create a shared topic
                <span aria-hidden="true" className="text-lg text-amber-700">+</span>
              </span>
            </summary>
            <form className="border-t border-stone-200 p-5 sm:p-6" onSubmit={handleCreateTopic}>
              <p className="text-sm leading-6 text-stone-600">
                Add a title and optional description for a note your group can build on.
              </p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-700" htmlFor="new-topic-title">Topic title</label>
                  <input
                    className="mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    id="new-topic-title"
                    maxLength={120}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Container networking"
                    required
                    value={title}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700" htmlFor="new-topic-description">
                    Short description <span className="text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    className="mt-1.5 min-h-20 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    id="new-topic-description"
                    maxLength={500}
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                </div>
                <button
                  className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
                  disabled={creating || !title.trim()}
                  type="submit"
                >
                  {creating ? "Creating…" : "Create topic"}
                </button>
              </div>
            </form>
          </details>
        ) : (
          <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-stone-700">
            Topic creation is available only during local development. Deployed
            editing requires a trusted API service.
          </p>
        )}
      </section>
    </main>
  );
}
