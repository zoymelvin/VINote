"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Chip } from "@/components/ui/chip";

export default function DesignPage() {
  return (
    <div className="p-4 md:p-8 space-y-4">
      <h1 className="text-2xl font-bold">Design</h1>
      <Card className="p-4 space-y-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Chip>Chip</Chip>
        <Skeleton className="h-10 w-40" />
      </Card>
    </div>
  );
}
