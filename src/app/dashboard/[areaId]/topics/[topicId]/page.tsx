import { notFound } from "next/navigation";
import Link from "next/link";
import { AuthRequired } from "@/components/auth/auth-required";
import { TopicEditor } from "@/components/topics/topic-editor";
import { isLearningAreaId } from "@/lib/data/types";
import { learningAreas } from "@/lib/learning-areas";

export default async function SharedTopicPage({
  params,
}: {
  params: Promise<{ areaId: string; topicId: string }>;
}) {
  const { areaId: rawAreaId, topicId } = await params;
  if (!isLearningAreaId(rawAreaId)) {
    notFound();
  }
  const area = learningAreas.find((item) => item.id === rawAreaId);
  if (!area) notFound();

  return (
    <AuthRequired>
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
          <Link className="hover:text-stone-900" href="/dashboard">
            Dashboard
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <Link className="hover:text-stone-900" href={`/dashboard/${rawAreaId}`}>
            {area.title}
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <span aria-current="page" className="font-medium text-stone-800">
            Shared topic
          </span>
        </nav>
        <TopicEditor areaId={rawAreaId} topicId={topicId} />
      </main>
    </AuthRequired>
  );
}
