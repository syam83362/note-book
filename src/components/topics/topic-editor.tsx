"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { getTopic, saveTopic } from "@/lib/data/client";
import type { LearningAreaId, LearningTopic } from "@/lib/data/types";
import { ProfileStack } from "./profile-stack";
import { TopicAttribution } from "./topic-attribution";

type TopicEditorProps = {
  topicId: string;
  areaId: LearningAreaId;
};

const canEdit = process.env.NODE_ENV === "development";

function formatDate(value: string | undefined) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TopicEditor({ topicId, areaId }: TopicEditorProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState<LearningTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [baseRevision, setBaseRevision] = useState<number | null>(null);
  const dirtyRef = useRef(false);
  const latestTopic = useRef<LearningTopic | null>(null);
  const baseRevisionRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      try {
        const latest = await getTopic(user, areaId, topicId);
        if (!active) return;
        latestTopic.current = latest;
        setTopic(latest);
        if (!dirtyRef.current) {
          baseRevisionRef.current = latest.revision;
          setBaseRevision(latest.revision);
          setTitle(latest.title);
          setDescription(latest.description);
          setContent(latest.content);
        }
        setNotFound(false);
        setError(null);
      } catch (loadError) {
        if (!active) return;
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load this topic.";
        if (message === "Topic not found.") setNotFound(true);
        else setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [areaId, topicId, user]);

  const loadLatestVersion = useCallback(() => {
    const latest = latestTopic.current;
    if (!latest) return;
    baseRevisionRef.current = latest.revision;
    setBaseRevision(latest.revision);
    dirtyRef.current = false;
    setDirty(false);
    setError(null);
    setSaveMessage(null);
    setTitle(latest.title);
    setDescription(latest.description);
    setContent(latest.content);
  }, []);

  async function handleSave() {
    if (!user || !topic || !title.trim() || baseRevisionRef.current === null) return;
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const updated = await saveTopic(
        user,
        { id: topic.id, areaId },
        {
          title,
          description,
          content,
          expectedRevision: baseRevisionRef.current,
        },
      );
      latestTopic.current = updated;
      baseRevisionRef.current = updated.revision;
      setBaseRevision(updated.revision);
      setTopic(updated);
      dirtyRef.current = false;
      setDirty(false);
      setSaveMessage("Saved to the local JSON data files.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this topic.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section
        aria-label="Loading shared notes"
        className="mt-8 h-80 animate-pulse rounded-xl border border-stone-200 bg-stone-50"
      />
    );
  }

  if (notFound) {
    return (
      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-950">Topic not found</h2>
        <p className="mt-2 text-sm text-stone-600">
          This topic may have been removed or the link may be incorrect.
        </p>
        <Link
          className="mt-4 inline-flex text-sm font-medium text-stone-800 underline underline-offset-4"
          href={`/dashboard/${areaId}`}
        >
          Back to learning area
        </Link>
      </section>
    );
  }

  const newerVersionAvailable =
    Boolean(topic) && dirty && topic!.revision !== baseRevision;

  return (
    <section
      aria-labelledby="shared-notes-heading"
      className="mt-8 rounded-xl border border-amber-300 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Local JSON · auto-refresh
          </p>
          <h2
            className="mt-2 text-xl font-semibold tracking-tight text-stone-950"
            id="shared-notes-heading"
          >
            Topic notes
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Changes are polled from local JSON every few seconds. Markdown is
            supported, including headings, lists, inline code, and fenced code blocks.
          </p>
        </div>
        {topic && <ProfileStack label="Contributors" userIds={topic.contributorIds} />}
      </div>

      {topic && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-stone-500"
                htmlFor={`${topicId}-title`}
              >
                Topic title
              </label>
              <input
                className="mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                disabled={!canEdit}
                id={`${topicId}-title`}
                maxLength={120}
                onChange={(event) => {
                  setTitle(event.target.value);
                  dirtyRef.current = true;
                  setDirty(true);
                }}
                value={title}
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-stone-500"
                htmlFor={`${topicId}-description`}
              >
                Short description
              </label>
              <input
                className="mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                disabled={!canEdit}
                id={`${topicId}-description`}
                maxLength={500}
                onChange={(event) => {
                  setDescription(event.target.value);
                  dirtyRef.current = true;
                  setDirty(true);
                }}
                value={description}
              />
            </div>
          </div>

          <TopicAttribution creatorId={topic.createdBy} editorId={topic.updatedBy} />
          <p className="mt-1 text-xs text-stone-500">
            Last updated {formatDate(topic.updatedAt)}
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-stone-500"
                htmlFor={`${topicId}-markdown`}
              >
                Markdown
              </label>
              <textarea
                className="mt-1.5 min-h-[24rem] w-full resize-y rounded-lg border border-stone-300 bg-white p-4 font-mono text-sm leading-6 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                disabled={!canEdit}
                id={`${topicId}-markdown`}
                onChange={(event) => {
                  setContent(event.target.value);
                  dirtyRef.current = true;
                  setDirty(true);
                  setSaveMessage(null);
                }}
                value={content}
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Preview
              </p>
              <article className="markdown-content mt-1.5 min-h-[24rem] overflow-x-auto rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </article>
            </div>
          </div>
        </>
      )}

      {!canEdit && (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-stone-700">
          Read-only outside local development. A trusted API write service is a
          future requirement; browser code does not write repository files.
        </p>
      )}

      {newerVersionAvailable && (
        <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 sm:flex-row sm:items-center">
          <p className="text-sm leading-6 text-stone-700" role="status">
            A newer revision is available. Reload it before saving; your unsaved
            changes will be replaced.
          </p>
          <button
            className="min-h-10 shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
            onClick={loadLatestVersion}
            type="button"
          >
            Load latest version
          </button>
        </div>
      )}

      {error && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {saveMessage && <p className="mt-4 text-sm text-green-800" role="status">{saveMessage}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          {canEdit
            ? "Save writes to local JSON files. Revision checks help prevent accidental overwrites."
            : "Content comes from project JSON files; deploy-time editing is not enabled."}
        </p>
        {canEdit && (
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!dirty || saving || !title.trim() || !topic}
            onClick={handleSave}
            type="button"
          >
            {saving ? "Saving…" : "Save shared notes"}
          </button>
        )}
      </div>
    </section>
  );
}
