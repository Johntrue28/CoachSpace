"use client";

import { CountBadge } from "@/components/ui/Badge";

export function CountDot({ text }: { text: string }) {
  return <CountBadge text={text} overlay />;
}
