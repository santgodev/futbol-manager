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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Frosted glass bar */}
      <div className="bg-[#04080f]/95 backdrop-blur-xl border-t border-brand-navy/60">
        <div className="flex items-stretch h-[62px]">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => handleTap(id)}
                className={`sport-tab ${isActive ? "active" : ""}`}
                aria-label={label}
              >
                {/* Active indicator bar at top */}
                <span
                  className={`absolute top-0 w-6 h-[2px] rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)] opacity-100"
                      : "opacity-0"
                  }`}
                />

                <span className="sport-tab-icon relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-all duration-200 ${
                      isActive ? "text-[#00f0ff]" : "text-brand-aqua/45"
                    }`}
                  />
                  {/* Live dot for "Partidos" when active */}
                  {id === "partidos" && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 live-pulse" />
                  )}
                </span>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive ? "text-[#00f0ff]" : "text-brand-aqua/40"
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
