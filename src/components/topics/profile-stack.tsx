"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { listUserProfiles } from "@/lib/data/client";
import type { UserProfile } from "@/lib/data/types";

function ProfileBubble({ profile }: { profile: UserProfile }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (profile.avatarUrl && !imageFailed) {
    return (
      <Image
        alt=""
        aria-hidden="true"
        className="h-8 w-8 rounded-full border-2 border-white object-cover"
        height={32}
        onError={() => setImageFailed(true)}
        src={profile.avatarUrl}
        title={profile.name}
        unoptimized
        width={32}
      />
    );
  }

  return (
    <span
      aria-label={profile.name}
      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-50 text-[10px] font-semibold text-stone-700"
      title={profile.name}
    >
      {initials || "L"}
    </span>
  );
}

export function ProfileStack({
  userIds,
  label = "Contributors",
}: {
  userIds: string[];
  label?: string;
}) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ids = [...new Set(userIds)].sort().join(",");

  useEffect(() => {
    let active = true;
    if (!user) return;
    void listUserProfiles(user, ids ? ids.split(",") : [])
      .then((nextProfiles) => {
        if (active) {
          setProfiles(nextProfiles);
          setError(null);
        }
      })
      .catch((profileError: unknown) => {
        if (active) {
          setError(
            profileError instanceof Error
              ? profileError.message
              : "Unable to load contributor profiles.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [ids, user]);

  if (profiles.length === 0) {
    return error ? (
      <span className="text-xs text-red-700" role="status">
        {error}
      </span>
    ) : (
      <span className="text-xs text-stone-500">{label}: {userIds.length}</span>
    );
  }

  return (
    <div aria-label={label} className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {profiles.slice(0, 5).map((profile) => (
          <ProfileBubble key={profile.uid} profile={profile} />
        ))}
      </div>
      <span className="text-xs text-stone-500">
        {label} · {userIds.length}
      </span>
    </div>
  );
}
