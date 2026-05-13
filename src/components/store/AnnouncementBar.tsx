"use client";

import { useState, useEffect } from "react";
import { publicApi } from "@/lib/api";
import type { CmsAnnouncement } from "@/types";

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<CmsAnnouncement | null>(null);

  useEffect(() => {
    // Para no bloquear la UI principal, cargamos el anuncio asíncronamente
    publicApi.getAnnouncement().then(res => {
      if (res.data && res.data.is_active) {
        setAnnouncement(res.data);
      }
    }).catch(err => console.error("Error loading announcement", err));
  }, []);

  if (!announcement) return null;

  const content = (
    <div 
      className="announcement-bar" 
      style={{ backgroundColor: announcement.bg_color, color: announcement.text_color }}
    >
      {announcement.text}
    </div>
  );

  if (announcement.link_url) {
    return <a href={announcement.link_url}>{content}</a>;
  }

  return content;
}
