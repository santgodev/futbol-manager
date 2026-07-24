"use client";

import { motion } from "framer-motion";
import { Tables } from "@/types/supabase";
import { MapPin, Calendar, Users, ChevronDown } from "lucide-react";

interface TournamentHeroProps {
  tournament: Tables<"tournaments"> & { teams_count: number };
}

/** Status → badge config */
function getStatusConfig(status: string, registrationStatus?: string | null) {
  switch (status) {
    case "IN_PROGRESS":
      return { label: "EN CURSO", isLive: false, color: "text-emerald-400", borderColor: "border-emerald-500/30", bg: "bg-emerald-500/10" };
    case "REGISTRATION":
      return { label: "INSCRIPCIONES ABIERTAS", isLive: false, color: "text-emerald-400", borderColor: "border-emerald-500/30", bg: "bg-emerald-500/10" };
    case "UPCOMING":
      return { label: "PRÓXIMAMENTE", isLive: false, color: "text-brand-sand", borderColor: "border-brand-sand/20", bg: "bg-brand-sand/5" };
    case "FINISHED":
      return { label: "FINALIZADO", isLive: false, color: "text-white/40", borderColor: "border-white/10", bg: "bg-white/5" };
    default:
      return { label: status, isLive: false, color: "text-brand-teal", borderColor: "border-brand-teal/20", bg: "bg-brand-teal/5" };
  }
}

/** Fecha compacta: "20 may. 2026" */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Por definir";
  try {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return "Por definir";
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(d);
  } catch {
    return "Por definir";
  }
}

export const TournamentHero = ({ tournament }: TournamentHeroProps) => {
  const status = getStatusConfig(tournament.status, tournament.registration_status);
  const startDateLabel = formatDate(tournament.start_date);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full flex flex-col overflow-hidden bg-background pt-16 pb-8">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #001133 0%, #002266 55%, #000a1a 100%)" }} />

      {/* Atmosphere glow */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,136,255,0.2) 0%, rgba(0,240,255,0.15) 40%, transparent 80%)" }}
      />

      {/* Cyberpunk grid floor */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-[50%]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to top, rgba(0,240,255,0.08) 1px, transparent 1px), linear-gradient(to right, rgba(0,240,255,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            transform: "perspective(400px) rotateX(55deg) scale(2)",
            transformOrigin: "top center",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 60%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-5 gap-5">

        {/* Status badge */}
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-[0.3em] uppercase ${status.color} ${status.borderColor} ${status.bg}`}
        >
          {status.isLive && (
            <span className="w-2 h-2 rounded-full bg-red-500 live-pulse shrink-0" />
          )}
          {status.label}
        </motion.div>

        {/* Tournament name */}
        <motion.h1
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="hero-title text-[11vw] sm:text-[10vw] md:text-[7rem] lg:text-[120px] leading-[0.85] md:leading-[0.85] w-full max-w-[100vw] break-words"
        >
          {tournament.name.split(" ")[0]}
          {tournament.name.split(" ").slice(1).join(" ") && (
            <><br /><span className="text-[#cad5d6]">{tournament.name.split(" ").slice(1).join(" ")}</span></>
          )}
        </motion.h1>

        {/* Compact metadata — 1 line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-brand-aqua/60 font-mono uppercase tracking-wider"
        >
          {tournament.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {tournament.location}
            </span>
          )}
          {tournament.start_date && (
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {startDateLabel}
            </span>
          )}
          {tournament.teams_count > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {tournament.teams_count} equipos
            </span>
          )}
        </motion.div>

        {/* CTA buttons — thumb-friendly */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex gap-3 w-full max-w-sm mt-1 relative z-50"
        >
          <button
            onClick={() => scrollTo("posiciones")}
            className="btn-cta-primary flex-1 text-xs"
          >
            <span>🏆</span> Ver Tabla
          </button>
          <button
            onClick={() => scrollTo("partidos")}
            className="btn-cta-secondary flex-1 text-xs"
          >
            <span>⚽</span> Partidos
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col items-center gap-1 mt-2 text-white/20"
        >
          <ChevronDown size={16} className="animate-bounce" />
        </motion.div>

      </div>
    </section>
  );
};
