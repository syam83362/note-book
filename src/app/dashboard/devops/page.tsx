import { AuthRequired } from "@/components/auth/auth-required";
import { LearningAreaTopics } from "@/components/topics/learning-area-topics";

export default function DevOpsPage() {
  return (
    <AuthRequired>
      <LearningAreaTopics areaId="devops" />
    </AuthRequired>
  );
}
