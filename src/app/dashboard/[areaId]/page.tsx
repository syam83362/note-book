import { notFound } from "next/navigation";
import { AuthRequired } from "@/components/auth/auth-required";
import { LearningAreaTopics } from "@/components/topics/learning-area-topics";
import { isLearningAreaId } from "@/lib/data/types";

export default async function LearningAreaPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  const { areaId } = await params;
  if (!isLearningAreaId(areaId) || areaId === "devops") {
    notFound();
  }

  return (
    <AuthRequired>
      <LearningAreaTopics areaId={areaId} />
    </AuthRequired>
  );
}
