import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { useEffect, useState } from "react";

export interface Profile {
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

const DEFAULT_PROFILE: Profile = {
  displayName: "zoymelvin",
  username: "zoymelvin",
  email: "zoymelvin@email.com",
  avatarUrl: null,
};

export function useProfile(): Profile {
  const row = useLiveQuery(() => db.profiles.get("local"), []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    if (row?.avatarBlob) {
      url = URL.createObjectURL(row.avatarBlob);
      setAvatarUrl(url);
    } else {
      setAvatarUrl(row?.avatarUrl ?? null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [row?.avatarBlob, row?.avatarUrl]);

  if (!row) {
    return { ...DEFAULT_PROFILE, avatarUrl };
  }
  return {
    displayName: row.displayName || DEFAULT_PROFILE.displayName,
    username: row.username || DEFAULT_PROFILE.username,
    email: row.email || DEFAULT_PROFILE.email,
    avatarUrl,
  };
}

export async function getProfileRecord() {
  return db.profiles.get("local");
}