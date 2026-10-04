import { AuthRequired } from "@/components/auth/auth-required";
import { ProfileContent } from "@/components/profile/profile-content";

export default function ProfilePage() {
  return (
    <AuthRequired>
      <ProfileContent />
    </AuthRequired>
  );
}
