import "server-only";
import { randomUUID } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  LearningArea,
  LearningAreaId,
  LearningTopic,
  DockerGuideData,
  DockerGuideSection,
  DockerCodeExample,
  UserProfile,
} from "./types";
import { isLearningAreaId } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const areasFile = path.join(dataDirectory, "areas.json");
const topicsFile = path.join(dataDirectory, "topics.json");
const usersFile = path.join(dataDirectory, "users.json");
const dockerGuideFile = path.join(
  dataDirectory,
  "notes",
  "devops",
  "docker-fundamentals.json",
);

type TopicRecord = Omit<LearningTopic, "content"> & { noteFile: string };
let writeQueue = Promise.resolve();

function withWriteLock<T>(operation: () => Promise<T>) {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export class DataNotFoundError extends Error {}
export class TopicRevisionConflictError extends Error {
  constructor() {
    super("Another contributor saved a newer version. Reload it before saving.");
    this.name = "TopicRevisionConflictError";
  }
}
export class DockerGuideRevisionConflictError extends Error {
  constructor() {
    super("The Docker guide changed since it was opened. Reload it before saving.");
    this.name = "DockerGuideRevisionConflictError";
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDockerCodeExample(value: unknown): value is DockerCodeExample {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.language === "string" &&
    value.language.trim().length > 0 &&
    typeof value.code === "string" &&
    value.code.trim().length > 0 &&
    (value.output === undefined || typeof value.output === "string")
  );
}

function isDockerGuideSection(value: unknown): value is DockerGuideSection {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.description === "string" &&
    value.description.trim().length > 0 &&
    (value.codeExamples === undefined ||
      (Array.isArray(value.codeExamples) &&
        value.codeExamples.every(isDockerCodeExample)))
  );
}

function isDockerGuideData(value: unknown): value is DockerGuideData {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.description === "string" &&
    value.description.trim().length > 0 &&
    Number.isInteger(value.revision) &&
    Array.isArray(value.sections) &&
    value.sections.every(isDockerGuideSection)
  );
}

async function writeJsonAtomically(file: string, value: unknown) {
  const temporaryFile = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryFile, file);
}

function notePath(areaId: LearningAreaId, noteFile: string) {
  if (
    !isLearningAreaId(areaId) ||
    path.basename(noteFile) !== noteFile ||
    !noteFile.endsWith(".json")
  ) {
    throw new Error("Topic contains an invalid note file name.");
  }
  return path.join(dataDirectory, "notes", areaId, noteFile);
}

export async function listAreas() {
  return readJson<LearningArea[]>(areasFile);
}

async function allRecords() {
  return readJson<TopicRecord[]>(topicsFile);
}

async function materialize(record: TopicRecord): Promise<LearningTopic> {
  const note = await readJson<{ format: string; content: string }>(
    notePath(record.areaId, record.noteFile),
  );
  if (note.format !== "markdown" || typeof note.content !== "string") {
    throw new Error(`Note data for topic ${record.id} is invalid.`);
  }
  return {
    id: record.id,
    areaId: record.areaId,
    title: record.title,
    description: record.description,
    content: note.content,
    createdBy: record.createdBy,
    contributorIds: record.contributorIds,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
    revision: record.revision,
  };
}

export async function listTopics(areaId: LearningAreaId) {
  const records = (await allRecords())
    .filter((record) => record.areaId === areaId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return Promise.all(records.map(materialize));
}

export async function getTopic(areaId: LearningAreaId, topicId: string) {
  const record = (await allRecords()).find(
    (candidate) => candidate.areaId === areaId && candidate.id === topicId,
  );
  if (!record) {
    throw new DataNotFoundError("Topic not found.");
  }
  return materialize(record);
}

export async function getDockerGuide() {
  const guide = await readJson<unknown>(dockerGuideFile);
  if (!isDockerGuideData(guide)) {
    throw new Error("Docker guide data in its JSON file is invalid.");
  }
  return guide;
}

export async function saveDockerGuide(
  input: unknown,
  expectedRevision: unknown,
) {
  return withWriteLock(async () => {
    const current = await getDockerGuide();
    if (typeof expectedRevision !== "number" || !Number.isInteger(expectedRevision)) {
      throw new Error("Docker guide update is invalid.");
    }
    if (current.revision !== expectedRevision) {
      throw new DockerGuideRevisionConflictError();
    }

    const candidate = isRecord(input)
      ? { ...input, revision: current.revision + 1 }
      : null;
    if (!candidate || !isDockerGuideData(candidate)) {
      throw new Error("Docker guide update is invalid.");
    }

    const updated: DockerGuideData = {
      ...candidate,
      title: candidate.title.trim(),
      description: candidate.description.trim(),
      revision: current.revision + 1,
      sections: candidate.sections.map((section) => ({
        ...section,
        title: section.title.trim(),
        description: section.description.trim(),
        codeExamples: section.codeExamples?.map((example) => ({
          ...example,
          language: example.language.trim(),
        })),
      })),
    };
    if (
      !isDockerGuideData(updated) ||
      updated.title.length > 120 ||
      updated.description.length > 1000 ||
      updated.sections.length > 100 ||
      updated.sections.some(
        (section) =>
          section.title.length > 120 ||
          section.description.length > 10000 ||
          (section.codeExamples?.some(
            (example) =>
              example.language.length > 40 ||
              example.code.length > 100000 ||
              (example.output?.length ?? 0) > 100000,
          ) ??
            false),
      ) ||
      JSON.stringify(updated).length > 1_000_000
    ) {
      throw new Error("Docker guide update is invalid.");
    }
    const sectionIds = updated.sections.map((section) => section.id);
    if (new Set(sectionIds).size !== sectionIds.length) {
      throw new Error("Docker guide section IDs must be unique.");
    }
    for (const section of updated.sections) {
      const exampleIds = (section.codeExamples ?? []).map(
        (example) => example.id,
      );
      if (new Set(exampleIds).size !== exampleIds.length) {
        throw new Error("Code example IDs must be unique within each section.");
      }
    }
    await writeJsonAtomically(dockerGuideFile, updated);
    return updated;
  });
}

export async function listUserProfiles(uids: string[]) {
  const users = await readJson<unknown>(usersFile);
  if (
    !Array.isArray(users) ||
    users.some(
      (user: unknown) =>
        typeof user !== "object" ||
        user === null ||
        !("uid" in user) ||
        typeof user.uid !== "string" ||
        !("name" in user) ||
        typeof user.name !== "string" ||
        !("email" in user) ||
        typeof user.email !== "string" ||
        !("avatarUrl" in user) ||
        (user.avatarUrl !== null && typeof user.avatarUrl !== "string") ||
        !("active" in user) ||
        typeof user.active !== "boolean",
    )
  ) {
    throw new Error("User profile data in data/users.json is invalid.");
  }
  const requested = new Set(uids);
  return (users as UserProfile[]).filter(
    (user) => requested.has(user.uid) && user.active,
  );
}

export async function createTopic(
  areaId: LearningAreaId,
  title: string,
  description: string,
  uid: string,
) {
  return withWriteLock(async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || cleanTitle.length > 120 || cleanDescription.length > 500) {
      throw new Error("Topic title or description is invalid.");
    }
    const records = await allRecords();
    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "topic";
    const id = `${slug}-${randomUUID().slice(0, 8)}`;
    const noteFile = `${id}.json`;
    const now = new Date().toISOString();
    const record: TopicRecord = {
      id,
      areaId,
      title: cleanTitle,
      description: cleanDescription,
      noteFile,
      createdBy: uid,
      contributorIds: [uid],
      createdAt: now,
      updatedAt: now,
      updatedBy: uid,
      revision: 1,
    };
    const noteFilePath = notePath(areaId, noteFile);
    await writeJsonAtomically(noteFilePath, {
      format: "markdown",
      content: `# ${cleanTitle}\n\n${cleanDescription}\n\n`,
    });
    try {
      await writeJsonAtomically(topicsFile, [...records, record]);
    } catch (error) {
      await unlink(noteFilePath);
      throw error;
    }
    return { id };
  });
}

export async function saveTopic(
  areaId: LearningAreaId,
  topicId: string,
  input: {
    title: string;
    description: string;
    content: string;
    expectedRevision: number;
  },
  uid: string,
) {
  return withWriteLock(async () => {
    const title = input.title.trim();
    const description = input.description.trim();
    if (
      !title ||
      title.length > 120 ||
      description.length > 500 ||
      input.content.length > 1_000_000 ||
      !Number.isInteger(input.expectedRevision)
    ) {
      throw new Error("Topic update is invalid.");
    }
    const records = await allRecords();
    const index = records.findIndex(
      (record) => record.areaId === areaId && record.id === topicId,
    );
    if (index < 0) {
      throw new DataNotFoundError("Topic not found.");
    }
    const current = records[index];
    if (current.revision !== input.expectedRevision) {
      throw new TopicRevisionConflictError();
    }
    const updated: TopicRecord = {
      ...current,
      title,
      description,
      contributorIds: [...new Set([...current.contributorIds, uid])],
      updatedAt: new Date().toISOString(),
      updatedBy: uid,
      revision: current.revision + 1,
    };
    const updatedRecords = [...records];
    updatedRecords[index] = updated;
    const noteFile = notePath(areaId, current.noteFile);
    const oldNote = await readJson<{ format: string; content: string }>(noteFile);
    await writeJsonAtomically(noteFile, {
      format: "markdown",
      content: input.content,
    });
    try {
      await writeJsonAtomically(topicsFile, updatedRecords);
    } catch (error) {
      await writeJsonAtomically(noteFile, oldNote);
      throw error;
    }
    return materialize(updated);
  });
}
