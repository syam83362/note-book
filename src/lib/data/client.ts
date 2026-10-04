import type { User } from "@firebase/auth";
import type {
  LearningArea,
  LearningAreaId,
  LearningTopic,
  DockerGuideData,
  UserProfile,
} from "./types";

type ApiResult<T> = { data: T };

async function request<T>(user: User, path: string, init?: RequestInit) {
  const token = await user.getIdToken();
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const result = (await response.json()) as ApiResult<T> & { error?: string };

  if (!response.ok) {
    throw new Error(result.error || `Request failed (${response.status}).`);
  }

  return result.data;
}

export function listAreas(user: User) {
  return request<LearningArea[]>(user, "/api/areas");
}

export function listTopics(user: User, areaId: LearningAreaId) {
  return request<LearningTopic[]>(user, `/api/topics/${areaId}`);
}

export function getTopic(
  user: User,
  areaId: LearningAreaId,
  topicId: string,
) {
  return request<LearningTopic>(
    user,
    `/api/topics/${areaId}/${encodeURIComponent(topicId)}`,
  );
}

export function createTopic(
  user: User,
  areaId: LearningAreaId,
  title: string,
  description: string,
) {
  return request<{ id: string }>(user, `/api/topics/${areaId}`, {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export function saveTopic(
  user: User,
  topic: Pick<LearningTopic, "id" | "areaId">,
  data: Pick<LearningTopic, "title" | "description" | "content"> & {
    expectedRevision: number;
  },
) {
  return request<LearningTopic>(
    user,
    `/api/topics/${topic.areaId}/${encodeURIComponent(topic.id)}`,
    { method: "PUT", body: JSON.stringify(data) },
  );
}

export function getDockerGuide(user: User) {
  return request<DockerGuideData>(user, "/api/docker-guide");
}

export function saveDockerGuide(
  user: User,
  guide: DockerGuideData,
  expectedRevision: number,
) {
  return request<DockerGuideData>(user, "/api/docker-guide", {
    method: "PUT",
    body: JSON.stringify({ guide, expectedRevision }),
  });
}

export function listUserProfiles(user: User, uids: string[]) {
  const query = new URLSearchParams({ ids: [...new Set(uids)].join(",") });
  return request<UserProfile[]>(user, `/api/users?${query}`);
}
