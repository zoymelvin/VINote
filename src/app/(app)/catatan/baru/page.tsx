"use client";
import { useEffect } from "react";
import { createNote } from "@/lib/db/repo";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();
  useEffect(() => {
    createNote({ type: "text", title: "" }).then((n) => router.replace(`/catatan/${n.id}`));
  }, [router]);
  return <div className="p-4">Membuat catatan...</div>;
}
