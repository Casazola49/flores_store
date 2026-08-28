"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useCMSStore } from "@/lib/store";

export default function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const { announcement, fetchCMS, sections } = useCMSStore();

  useEffect(() => {
    setMounted(true);
    fetchCMS();
  }, [fetchCMS]);

  useEffect(() => {
    if (mounted) {
      const active = !!(announcement && announcement.is_active);
      document.documentElement.style.setProperty(
        "--announcement-height",
        active ? "36px" : "0px"
      );
    }
  }, [mounted, announcement]);

  useEffect(() => {
    const endHourStr = sections.countdown_end_hour || "24";
    const endHour = parseInt(endHourStr, 10) || 24;

    const calc = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(endHour, 0, 0, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      const diff = end.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();

    const timeInterval = setInterval(calc, 1000);
    return () => clearInterval(timeInterval);
  }, [mounted, sections.countdown_end_hour]);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (!mounted || !announcement || !announcement.is_active) return null;

  return (
    <div 
      className="w-full transition-all duration-300"
      style={{
        backgroundColor: announcement.bg_color || "#0A0A0A",
        color: announcement.text_color || "#FFFFFF"
      }}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-2">
        <div className="flex-1 text-center">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase truncate">
            {announcement.text}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 ml-6">
          <Clock size={10} style={{ color: announcement.text_color || "#FFFFFF" }} className="opacity-80" />
          <span className="text-[10px] font-bold tracking-widest tabular-nums">
            {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
          </span>
        </div>
      </div>
    </div>
  );
}
