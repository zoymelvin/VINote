import { create } from "zustand";
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
  const settings = useLiveQuery(() => db.settings.toArray().then((s) => s[0]), []);
  const meta = useLiveQuery(() => db.meta.where("key").equals("profile").first(), []);
  const profile = (meta?.value as Profile) ?? DEFAULT_PROFILE;
  return {
    displayName: profile.displayName || DEFAULT_PROFILE.displayName,
    username: profile.username || DEFAULT_PROFILE.username,
    email: profile.email || DEFAULT_PROFILE.email,
    avatarUrl: profile.avatarUrl ?? null,
  };
}
