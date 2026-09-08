"use client";
import { useEffect, useMemo, useState } from "react";
import { useCMSStore } from "@/lib/store";
const blocked = new Set(["e5c400", "ffd700", "ffb300", "ffc107"].map(value => `#${value}`));
export default function AnnouncementBar() {
  const { announcement, fetchCMS } = useCMSStore(); const [mounted, setMounted] = useState(false); const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => { setMounted(true); fetchCMS(); }, [fetchCMS]);
  useEffect(() => { document.documentElement.style.setProperty("--announcement-height", announcement?.is_active ? "36px" : "0px"); }, [announcement]);
  const bg = useMemo(() => { const color = announcement?.bg_color?.toLowerCase().trim(); return color && !blocked.has(color) ? color : "var(--color-primary)"; }, [announcement]);
  useEffect(() => { const date = (announcement as unknown as { countdown_end_date?: string })?.countdown_end_date; if (!date) return; const end = new Date(date).getTime(); if (end <= Date.now()) return; const tick = () => setRemaining(Math.max(0, end - Date.now())); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, [announcement]);
  if (!mounted || !announcement?.is_active) return null;
  return <div className="w-full text-white" style={{ backgroundColor: bg }}><div className="px-4 py-2 text-center"><span className="text-label">{announcement.text}</span>{remaining !== null && <span className="text-label ml-4">{Math.floor(remaining / 3600000)}:{String(Math.floor(remaining / 60000) % 60).padStart(2, "0")}:{String(Math.floor(remaining / 1000) % 60).padStart(2, "0")}</span>}</div></div>;
}
