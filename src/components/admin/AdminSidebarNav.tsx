"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const AdminSidebarNav = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/tournaments", label: "Torneos" },
    { href: "/admin/teams", label: "Equipos" },
  ];

  if (isMobile) {
    return (
      <nav className="flex-1 flex items-center justify-around h-full w-full">
        {links.map((link) => {
          const isActive = link.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(link.href);

          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex-1 h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive 
                  ? "text-[#00f0ff] border-t-2 border-[#00f0ff] bg-gradient-to-t from-[#0055cc]/20 to-transparent shadow-[inset_0_-10px_20px_-15px_rgba(0,100,255,0.3)]"
                  : "text-white/50 border-t-2 border-transparent hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 py-8 flex flex-col gap-2">
      {links.map((link) => {
        // Exact match for dashboard, prefix match for others to keep them active when in sub-pages
        const isActive = link.href === "/admin" 
          ? pathname === "/admin" 
          : pathname.startsWith(link.href);

        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
              isActive 
                ? "bg-gradient-to-r from-[#0055cc]/20 to-transparent border-l-[3px] border-[#00f0ff] text-[#00f0ff] shadow-[inset_15px_0_20px_-15px_rgba(0,100,255,0.3)]"
                : "text-white/50 border-l-[3px] border-transparent hover:bg-[#0055cc]/10 hover:text-white hover:border-[#0055cc]/50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
