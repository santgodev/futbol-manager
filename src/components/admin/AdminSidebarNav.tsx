"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Trophy, 
  Shield, 
  ShieldCheck, 
  Layers, 
  Grid, 
  Calendar, 
  Clock, 
  UserPlus, 
  Users,
  BookOpen, 
  Settings, 
  CheckSquare, 
  FileText 
} from "lucide-react";
import type { PlatformRole } from "@/app/admin/pegasight-actions";

interface NavLinkItem {
  href: string;
  label: string;
  icon: any;
  badge?: number;
}

export const AdminSidebarNav = ({ 
  isMobile = false, 
  role = "SUPERADMINISTRADOR" 
}: { 
  isMobile?: boolean; 
  role?: PlatformRole;
}) => {
  const pathname = usePathname();

  let links: NavLinkItem[] = [];

  if (role === "ADMINISTRADOR_GENERAL") {
    links = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/tournaments", label: "Torneos", icon: Trophy },
      { href: "/admin/teams", label: "Equipos", icon: Shield },
      { href: "/admin/superadmins", label: "Superadmins", icon: ShieldCheck },
      { href: "/admin/tournament-admins", label: "Admins Torneo", icon: Users },
      { href: "/admin/result-users", label: "Usuarios Resultados", icon: UserPlus },
      { href: "/admin/pending-results", label: "Resultados Pendientes", icon: Clock },
      { href: "/admin/audit-logs", label: "Auditoría", icon: FileText },
    ];
  } else if (role === "SUPERADMINISTRADOR") {
    // A los superadministradores les salen todas las herramientas de gestión organizativa
    links = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/tournaments", label: "Torneos", icon: Trophy },
      { href: "/admin/teams", label: "Equipos", icon: Shield },
      { href: "/admin/tournament-admins", label: "Admins Torneo", icon: Users },
      { href: "/admin/result-users", label: "Usuarios Resultados", icon: UserPlus },
      { href: "/admin/pending-results", label: "Resultados Pendientes", icon: Clock },
      { href: "/admin/audit-logs", label: "Auditoría", icon: FileText },
    ];
  } else if (role === "ADMINISTRADOR_DEL_TORNEO") {
    links = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/tournaments", label: "Mis Torneos", icon: Trophy },
      { href: "/admin/teams", label: "Equipos", icon: Shield },
      { href: "/admin/result-users", label: "Usuarios Resultados", icon: UserPlus },
      { href: "/admin/pending-results", label: "Resultados Pendientes", icon: Clock },
    ];
  } else {
    // USUARIO_DE_RESULTADOS
    links = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/my-matches", label: "Mis Partidos", icon: Calendar },
      { href: "/admin/submit-result", label: "Registrar Resultado", icon: CheckSquare },
      { href: "/admin/my-submissions", label: "Resultados Enviados", icon: FileText },
    ];
  }

  if (isMobile) {
    return (
      <nav className="flex-1 flex items-center justify-around h-full w-full overflow-x-auto">
        {links.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 min-w-[64px] h-full flex flex-col items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider transition-all relative ${
                isActive
                  ? "text-[#00f0ff]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon
                size={18}
                className={`transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" : ""}`}
              />
              <span className="truncate max-w-[64px] text-center">{link.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar">
      {/* Section label */}
      <span className="px-6 text-[9px] text-[#00f0ff]/40 uppercase tracking-[0.25em] font-bold mb-2">
        {role === "ADMINISTRADOR_GENERAL"
          ? "ADMINISTRACIÓN GENERAL"
          : role === "SUPERADMINISTRADOR" 
          ? "PANEL GLOBAL" 
          : role === "ADMINISTRADOR_DEL_TORNEO" 
          ? "GESTIÓN TORNEO" 
          : "REGISTRO DE PARTIDOS"}
      </span>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center gap-3 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${
              isActive
                ? "text-[#00f0ff]"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/10 to-transparent rounded-r-xl" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#00f0ff] rounded-r-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              </>
            )}
            {/* Hover state */}
            {!isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            <Icon
              size={16}
              className={`relative z-10 transition-all shrink-0 ${
                isActive
                  ? "drop-shadow-[0_0_6px_rgba(0,240,255,0.7)]"
                  : "group-hover:text-white/70"
              }`}
            />
            <span className="relative z-10 truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
