"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { getDockerGuide, saveDockerGuide } from "@/lib/data/client";
import type {
  DockerCodeExample,
  DockerGuideData,
  DockerGuideSection,
} from "@/lib/data/types";

const canEdit = process.env.NODE_ENV === "development";
const inputClassName =
  "mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const textAreaClassName =
  "mt-1.5 min-h-28 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm leading-6 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const codeAreaClassName =
  "mt-1.5 min-h-36 w-full resize-y rounded-lg border border-stone-800 bg-stone-950 p-4 font-mono text-sm leading-6 text-stone-100 outline-none focus:ring-2 focus:ring-amber-400";
const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500";

function newCodeExample(): DockerCodeExample {
  return {
    id: crypto.randomUUID(),
    language: "sh",
    code: "",
  };
}

function newSection(): DockerGuideSection {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    codeExamples: [],
  };
}

function isGuideValid(guide: DockerGuideData) {
  return (
    Boolean(guide.title.trim()) &&
    Boolean(guide.description.trim()) &&
    guide.sections.every(
      (section) =>
        Boolean(section.title.trim()) &&
        Boolean(section.description.trim()) &&
        (section.codeExamples ?? []).every(
          (example) => Boolean(example.language.trim()) && Boolean(example.code.trim()),
        ),
    )
  );
}

export function DockerGuide() {
  const { user } = useAuth();
  const [guide, setGuide] = useState<DockerGuideData | null>(null);
  const [draft, setDraft] = useState<DockerGuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const requestGuide = useCallback(async () => {
    if (!user) throw new Error("Sign in to access the Docker guide.");
    return getDockerGuide(user);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function load() {
      try {
        const latest = await requestGuide();
        if (active) {
          setGuide(latest);
          setDraft(null);
          setEditing(false);
          setError(null);
          setSaveMessage(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the Docker guide.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [requestGuide, user]);

  async function reloadGuide() {
    if (!user) return;
    setLoading(true);
    try {
      const latest = await requestGuide();
      setGuide(latest);
      setDraft(null);
      setEditing(false);
      setError(null);
      setSaveMessage(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the Docker guide.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSection(
    sectionIndex: number,
    updates: Partial<DockerGuideSection>,
  ) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex ? { ...section, ...updates } : section,
        ),
      };
    });
  }

  function updateCodeExample(
    sectionIndex: number,
    exampleIndex: number,
    updates: Partial<DockerCodeExample>,
  ) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        sections: current.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                codeExamples: (section.codeExamples ?? []).map(
                  (example, currentExampleIndex) =>
                    currentExampleIndex === exampleIndex
                      ? { ...example, ...updates }
                      : example,
                ),
              }
            : section,
        ),
      };
    });
  }

  function moveSection(sectionIndex: number, direction: -1 | 1) {
    setDraft((current) => {
      if (!current) return current;
      const nextIndex = sectionIndex + direction;
      if (nextIndex < 0 || nextIndex >= current.sections.length) return current;
      const sections = [...current.sections];
      [sections[sectionIndex], sections[nextIndex]] = [
        sections[nextIndex],
        sections[sectionIndex],
      ];
      return { ...current, sections };
    });
  }

  function startEditing() {
    if (!guide) return;
    setDraft(structuredClone(guide));
    setEditing(true);
    setError(null);
    setSaveMessage(null);
  }

  function cancelEditing() {
    setDraft(null);
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (!user || !draft || !guide) return;
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const saved = await saveDockerGuide(user, draft, guide.revision);
      setGuide(saved);
      setDraft(null);
      setEditing(false);
      setSaveMessage("Saved to the Docker guide JSON file.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the Docker guide.",
      );
    } finally {
      setSaving(false);
    }
  }

  const currentGuide = editing ? draft : guide;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
        <Link className="hover:text-stone-900" href="/dashboard">
          Dashboard
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <Link className="hover:text-stone-900" href="/dashboard/devops">
          DevOps
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <span aria-current="page" className="font-medium text-stone-800">
          Docker
        </span>
      </nav>

      {error && (
        <div
          className="mt-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>{error}</p>
          {!loading && !saving && (
            <button
              className="min-h-10 shrink-0 rounded-lg border border-red-300 bg-white px-3 py-2 font-medium text-red-900 hover:bg-red-100"
              onClick={() => void reloadGuide()}
              type="button"
            >
              Reload latest guide
            </button>
          )}
        </div>
      )}

      {loading && !currentGuide && (
        <p className="mt-8 text-sm text-stone-500" role="status">
          Loading Docker guide…
        </p>
      )}

      {currentGuide && (
        <>
          <header className="mt-8 flex flex-col gap-5 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                DevOps · Containers
              </p>
              {editing ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium text-stone-700"
                      htmlFor="docker-guide-title"
                    >
                      Guide title <span className="text-red-600">*</span>
                    </label>
                    <input
                      className={inputClassName}
                      id="docker-guide-title"
                      maxLength={120}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? { ...current, title: event.target.value }
                            : current,
                        )
                      }
                      required
                      value={currentGuide.title}
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium text-stone-700"
                      htmlFor="docker-guide-description"
                    >
                      Guide description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      className={textAreaClassName}
                      id="docker-guide-description"
                      maxLength={1000}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? { ...current, description: event.target.value }
                            : current,
                        )
                      }
                      required
                      value={currentGuide.description}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                    {currentGuide.title}
                  </h1>
                  <p className="mt-3 text-base leading-7 text-stone-600">
                    {currentGuide.description}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canEdit && editing ? (
                <>
                  <button
                    className={secondaryButtonClassName}
                    disabled={saving}
                    onClick={cancelEditing}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
                    disabled={saving || !isGuideValid(currentGuide)}
                    onClick={() => void handleSave()}
                    type="button"
                  >
                    {saving ? "Saving…" : "Save notebook"}
                  </button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <button
                      className={secondaryButtonClassName}
                      onClick={startEditing}
                      type="button"
                    >
                      Edit notebook
                    </button>
                  )}
                  <Link
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                    href="/dashboard/devops/topics/docker-notes"
                  >
                    Shared notes
                    <span aria-hidden="true" className="ml-2 text-amber-700">
                      →
                    </span>
                  </Link>
                </>
              )}
            </div>
          </header>

          {canEdit && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs leading-5 text-stone-500">
                Editor changes are saved to the project JSON file. Code examples
                are not executed.
              </p>
              {saveMessage && (
                <p className="text-sm font-medium text-green-800" role="status">
                  {saveMessage}
                </p>
              )}
            </div>
          )}

          <div className="mx-auto mt-8 max-w-4xl space-y-5">
            {currentGuide.sections.map((section, sectionIndex) => (
              <section
                aria-labelledby={`docker-section-${section.id}`}
                className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
                key={section.id}
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900"
                  >
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Text cell
                          </p>
                          <div className="flex gap-2">
                            <button
                              aria-label={`Move ${section.title || "section"} up`}
                              className={secondaryButtonClassName}
                              disabled={sectionIndex === 0}
                              onClick={() => moveSection(sectionIndex, -1)}
                              type="button"
                            >
                              Move up
                            </button>
                            <button
                              aria-label={`Move ${section.title || "section"} down`}
                              className={secondaryButtonClassName}
                              disabled={sectionIndex === currentGuide.sections.length - 1}
                              onClick={() => moveSection(sectionIndex, 1)}
                              type="button"
                            >
                              Move down
                            </button>
                            <button
                              className="min-h-10 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setDraft((current) =>
                                  current
                                    ? {
                                        ...current,
                                        sections: current.sections.filter(
                                          (_, index) => index !== sectionIndex,
                                        ),
                                      }
                                    : current,
                                )
                              }
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium text-stone-700"
                            htmlFor={`${section.id}-title`}
                          >
                            Section title <span className="text-red-600">*</span>
                          </label>
                          <input
                            className={inputClassName}
                            id={`${section.id}-title`}
                            maxLength={120}
                            onChange={(event) =>
                              updateSection(sectionIndex, {
                                title: event.target.value,
                              })
                            }
                            required
                            value={section.title}
                          />
                        </div>
                        <div>
                          <label
                            className="text-sm font-medium text-stone-700"
                            htmlFor={`${section.id}-description`}
                          >
                            Description <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            className={textAreaClassName}
                            id={`${section.id}-description`}
                            maxLength={10000}
                            onChange={(event) =>
                              updateSection(sectionIndex, {
                                description: event.target.value,
                              })
                            }
                            required
                            value={section.description}
                          />
                        </div>
                        <div className="markdown-content rounded-lg bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {section.description || "Description preview"}
                          </ReactMarkdown>
                        </div>

                        {(section.codeExamples ?? []).map(
                          (example, exampleIndex) => (
                            <div
                              className="rounded-xl border border-stone-200 p-4 sm:p-5"
                              key={example.id}
                            >
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                  Code cell {exampleIndex + 1}
                                </p>
                                <button
                                  className="min-h-9 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    updateSection(sectionIndex, {
                                      codeExamples: (
                                        section.codeExamples ?? []
                                      ).filter((_, index) => index !== exampleIndex),
                                    })
                                  }
                                  type="button"
                                >
                                  Remove cell
                                </button>
                              </div>
                              <div>
                                <label
                                  className="text-sm font-medium text-stone-700"
                                  htmlFor={`${example.id}-language`}
                                >
                                  Language <span className="text-red-600">*</span>
                                </label>
                                <input
                                  className={inputClassName}
                                  id={`${example.id}-language`}
                                  maxLength={40}
                                  onChange={(event) =>
                                    updateCodeExample(
                                      sectionIndex,
                                      exampleIndex,
                                      { language: event.target.value },
                                    )
                                  }
                                  placeholder="sh, dockerfile, yaml…"
                                  required
                                  value={example.language}
                                />
                              </div>
                              <div className="mt-4">
                                <label
                                  className="text-sm font-medium text-stone-700"
                                  htmlFor={`${example.id}-code`}
                                >
                                  Code <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  className={codeAreaClassName}
                                  id={`${example.id}-code`}
                                  maxLength={100000}
                                  onChange={(event) =>
                                    updateCodeExample(
                                      sectionIndex,
                                      exampleIndex,
                                      { code: event.target.value },
                                    )
                                  }
                                  required
                                  value={example.code}
                                />
                              </div>
                              <div className="mt-4">
                                <label
                                  className="text-sm font-medium text-stone-700"
                                  htmlFor={`${example.id}-output`}
                                >
                                  Output{" "}
                                  <span className="text-stone-400">(optional)</span>
                                </label>
                                <textarea
                                  className={`${codeAreaClassName} min-h-24`}
                                  id={`${example.id}-output`}
                                  maxLength={100000}
                                  onChange={(event) =>
                                    updateCodeExample(
                                      sectionIndex,
                                      exampleIndex,
                                      {
                                        output: event.target.value || undefined,
                                      },
                                    )
                                  }
                                  placeholder="Paste representative output here"
                                  value={example.output ?? ""}
                                />
                              </div>
                            </div>
                          ),
                        )}

                        <button
                          className={secondaryButtonClassName}
                          onClick={() =>
                            updateSection(sectionIndex, {
                              codeExamples: [
                                ...(section.codeExamples ?? []),
                                newCodeExample(),
                              ],
                            })
                          }
                          type="button"
                        >
                          + Add code cell
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2
                          className="text-lg font-semibold tracking-tight text-stone-950 sm:text-xl"
                          id={`docker-section-${section.id}`}
                        >
                          {section.title}
                        </h2>
                        <div className="markdown-content mt-2 text-sm leading-7 text-stone-600">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {section.description}
                          </ReactMarkdown>
                        </div>

                        {section.codeExamples?.map((example) => (
                          <div
                            className="mt-5 overflow-hidden rounded-xl border border-stone-800 bg-stone-950"
                            key={example.id}
                          >
                            <div className="border-b border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                              {example.language}
                            </div>
                            <pre className="overflow-x-auto p-4 text-sm leading-6 text-stone-100">
                              <code>{example.code}</code>
                            </pre>
                            {example.output && (
                              <div className="border-t border-white/10 bg-stone-900">
                                <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
                                  Output
                                </p>
                                <pre className="overflow-x-auto whitespace-pre-wrap p-4 pt-2 text-sm leading-6 text-stone-300">
                                  <code>{example.output}</code>
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {editing && (
            <div className="mx-auto mt-5 flex max-w-4xl justify-center">
              <button
                className={secondaryButtonClassName}
                onClick={() =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          sections: [...current.sections, newSection()],
                        }
                      : current,
                  )
                }
                type="button"
              >
                + Add text cell
              </button>
            </div>
          )}

          {!editing && !canEdit && (
            <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-stone-700">
              The Docker notebook is read-only outside local development.
            </p>
          )}
        </>
      )}
    </main>
  );
}
