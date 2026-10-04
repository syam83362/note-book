"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { listUserProfiles } from "@/lib/data/client";
import type { UserProfile } from "@/lib/data/types";

export function TopicAttribution({
  creatorId,
  editorId,
}: {
  creatorId: string;
  editorId: string;
}) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) return;
    void listUserProfiles(user, [creatorId, editorId])
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
  }, [creatorId, editorId, user]);

  const nameFor = (uid: string) =>
    profiles.find((profile) => profile.uid === uid)?.name ||
    (uid === "starter-content" ? "DevLearn starter content" : null) ||
    (uid === creatorId && uid === editorId ? "Contributor" : "a contributor");

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
      <span>Created by {nameFor(creatorId)}</span>
      <span>Last edited by {nameFor(editorId)}</span>
      {error && (
        <span className="text-amber-700" role="status">
          Contributor names are unavailable: {error}
        </span>
      )}
    </div>
  );
}
