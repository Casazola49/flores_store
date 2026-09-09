"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useCMSStore } from "@/lib/store";

const blocked = new Set(["e5c400", "ffd700", "ffb300", "ffc107"].map(value => `#${value}`));

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AnnouncementBar() {
  const { announcement } = useCMSStore();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const bg = useMemo(() => {
    const color = announcement?.bg_color?.toLowerCase().trim();
    return color && !blocked.has(color) ? color : "var(--color-primary)";
  }, [announcement]);

  if (!mounted || !announcement?.is_active) return null;

  return (
    <div className="w-full text-white" style={{ backgroundColor: bg }}>
      <div className="px-4 py-2 text-center">
        <span className="text-label">{announcement.text}</span>
      </div>
    </div>
  );
}
