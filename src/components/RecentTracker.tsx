"use client";

import { useEffect } from "react";
import { pushRecentType } from "@/lib/storage";

export default function RecentTracker({ code }: { code: string }) {
  useEffect(() => {
    pushRecentType(code);
  }, [code]);
  return null;
}
