"use client";

import { useEffect, useState } from "react";
import { Home, Calendar, Trophy, Star, BarChart3 } from "lucide-react";

const TABS = [
  { id: "top",       label: "Inicio",   Icon: Home      },
  { id: "partidos",  label: "Partidos", Icon: Calendar  },
  { id: "posiciones",label: "Tabla",    Icon: Trophy    },
  { id: "goleador",  label: "Goles",    Icon: Star      },
  { id: "tarjetas",  label: "Stats",    Icon: BarChart3 },
] as const;

export const MobileBottomNav = () => {
  const [activeId, setActiveId] = useState<string>("top");

  /* Track which section is in viewport */
  useEffect(() => {
    const sectionIds = TABS.map((t) => t.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { threshold: 0.35, rootMargin: "-10% 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleTap = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Ambient background glow below the nav */}
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[#020408] to-transparent pointer-events-none" />
      
      {/* Frosted glass bar */}
      <div className="bg-[#020408]/85 backdrop-blur-2xl border-t border-[#00f0ff]/20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />
        <div className="flex items-stretch h-[68px] px-2 relative z-10">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => handleTap(id)}
                className={`sport-tab relative flex flex-col items-center justify-center flex-1 transition-all duration-300 ${isActive ? "active" : ""}`}
                aria-label={label}
              >
                {/* Active indicator bar at top */}
                <span
                  className={`absolute top-0 w-8 h-[3px] rounded-b-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.9)] opacity-100"
                      : "bg-transparent opacity-0"
                  }`}
                />
                
                {/* Active glow behind icon */}
                {isActive && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#00f0ff]/10 blur-md rounded-full pointer-events-none" />
                )}

                <span className="sport-tab-icon relative mt-1">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-all duration-300 ${
                      isActive ? "text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "text-[#cad5d6]/40"
                    }`}
                  />
                  {/* Live dot for "Partidos" when active */}
                  {id === "partidos" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] live-pulse" />
                  )}
                </span>

                <span
                  className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 mt-1.5 ${
                    isActive ? "text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.3)]" : "text-[#cad5d6]/40 font-bold"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
