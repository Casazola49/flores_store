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
  const { isAuthenticated, isHydrating, rehydrate } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Rehidratar sesión desde el token persistido (sobrevive refresh / deep-link)
    void rehydrate();
  }, [rehydrate]);

  useEffect(() => {
    // Proteger rutas admin (excepto login). Espera hidratación para no
    // redirigir a login durante el refresh con token válido.
    if (!isHydrating && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isHydrating, pathname, router]);

  if (!mounted || isHydrating) return null; // Prevenir hidratación mismatch / falso login

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
