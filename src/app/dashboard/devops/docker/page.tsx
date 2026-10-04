import { AuthRequired } from "@/components/auth/auth-required";
import { DockerGuide } from "@/components/topics/docker-guide";

export default function DockerPage() {
  return (
    <AuthRequired>
      <DockerGuide />
    </AuthRequired>
  );
}
