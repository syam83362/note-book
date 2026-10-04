export type LearningAreaId = "devops" | "devsecops" | "ai";

export type LearningArea = {
  id: LearningAreaId;
  number: string;
  title: string;
  description: string;
  topics: string[];
};

export type LearningTopic = {
  id: string;
  areaId: LearningAreaId;
  title: string;
  description: string;
  content: string;
  createdBy: string;
  contributorIds: string[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  revision: number;
};

export type DockerCodeExample = {
  id: string;
  language: string;
  code: string;
  output?: string;
};

export type DockerGuideSection = {
  id: string;
  title: string;
  description: string;
  codeExamples?: DockerCodeExample[];
};

export type DockerGuideData = {
  title: string;
  description: string;
  revision: number;
  sections: DockerGuideSection[];
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  active: boolean;
};

export function isLearningAreaId(value: string): value is LearningAreaId {
  return value === "devops" || value === "devsecops" || value === "ai";
}
