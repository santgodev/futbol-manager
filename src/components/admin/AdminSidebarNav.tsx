"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Shield } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tournaments", label: "Torneos", icon: Trophy },
  { href: "/admin/teams", label: "Equipos", icon: Shield },
];

export const AdminSidebarNav = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();

  if (isMobile) {
    return (
      <nav className="flex-1 flex items-center justify-around h-full w-full">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "text-[#00f0ff]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon
                size={20}
                className={`transition-all ${isActive ? "drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" : ""}`}
              />
              <span>{link.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-80" style={{ position: "absolute", bottom: 0 }} />
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 py-6 flex flex-col gap-1">
      {/* Section label */}
      <span className="px-8 text-[9px] text-[#00f0ff]/30 uppercase tracking-[0.3em] font-bold mb-2">Navegación</span>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 group ${
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
              className={`relative z-10 transition-all ${
                isActive
                  ? "drop-shadow-[0_0_6px_rgba(0,240,255,0.7)]"
                  : "group-hover:text-white/70"
              }`}
            />
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
