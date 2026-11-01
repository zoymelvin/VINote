import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";

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
  const avatarUrl = row?.avatarBlob ? URL.createObjectURL(row.avatarBlob) : (row?.avatarUrl ?? null);
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