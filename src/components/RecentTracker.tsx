"use client";

import { useEffect } from "react";
import { markTypeViewed, pushRecentType } from "@/lib/storage";

export default function RecentTracker({ code }: { code: string }) {
  useEffect(() => {
    pushRecentType(code);
    markTypeViewed(code);
  }, [code]);
  return null;
}
