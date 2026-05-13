"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Settings, 
  Image as ImageIcon,
  ShoppingCart,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Inventario", href: "/admin/inventario", icon: Layers },
    { name: "Productos", href: "/admin/productos", icon: Package },
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { name: "Banners CMS", href: "/admin/banners", icon: ImageIcon },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  ];

  if (!mounted) return null;

  return (
    <aside className="admin-sidebar">
      <div className="px-6 mb-10">
        <h2 className="text-2xl font-black tracking-tighter uppercase font-['Outfit'] text-white">
          FLORES<span className="text-[var(--color-accent)]">.</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-[var(--color-accent)]" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-black/20">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-black font-bold text-sm uppercase">
            {user?.username?.charAt(0) || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.username || "Admin"}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{user?.role || "Administrador"}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
