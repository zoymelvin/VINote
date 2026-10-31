"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();
  useEffect(() => {
    const id = crypto.randomUUID();
    router.replace(`/catatan/${id}`);
  }, [router]);
  return <div className="p-4">Membuat catatan...</div>;
}
