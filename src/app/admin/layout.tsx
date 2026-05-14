"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { useAdminAuth } from "@/lib/store";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Proteger rutas admin (excepto login)
    if (!isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, pathname, router]);

  if (!mounted) return null; // Prevenir hidratación mismatch

  // Si es login, no mostrar sidebar
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Si no está autenticado y no es login, no renderizar nada (esperando redirección)
  if (!isAuthenticated) return null;

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
