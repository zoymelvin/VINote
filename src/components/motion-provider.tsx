"use client";
import { LazyMotion } from "motion/react";

const features = () => import("motion/react").then((mod) => mod.domAnimation);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={features}>{children}</LazyMotion>;
}
