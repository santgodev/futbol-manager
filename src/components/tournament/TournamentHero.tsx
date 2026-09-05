"use client";

import { motion } from "framer-motion";
import { Tables } from "@/types/supabase";
import { MapPin, Calendar, Users, ChevronDown, Trophy } from "lucide-react";

interface TournamentHeroProps {
  tournament: Tables<"tournaments"> & { teams_count: number };
}

function getStatusConfig(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return { label: "En curso",      dot: "bg-[#22c55e]", color: "text-[#22c55e]", border: "border-[#22c55e]/30", bg: "bg-[#22c55e]/10" };
    case "REGISTRATION":
      return { label: "Inscripciones", dot: "bg-[#22c55e]", color: "text-[#22c55e]", border: "border-[#22c55e]/30", bg: "bg-[#22c55e]/10" };
    case "UPCOMING":
      return { label: "Próximamente",  dot: "bg-[#f59e0b]", color: "text-[#f59e0b]", border: "border-[#f59e0b]/30", bg: "bg-[#f59e0b]/10" };
    case "FINISHED":
      return { label: "Finalizado",    dot: null,            color: "text-[#707b86]", border: "border-[#202830]",   bg: "bg-[#0a0f14]" };
    default:
      return { label: status,          dot: "bg-[#0a84ff]",  color: "text-[#0a84ff]", border: "border-[#0a84ff]/30", bg: "bg-[#0a84ff]/10" };
  }
}

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
  const status = getStatusConfig(tournament.status);
  const startDateLabel = formatDate(tournament.start_date);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#05080b]">

      {/* Subtle top glow — solo arriba, muy suave */}
      <div
        className="absolute inset-x-0 top-0 h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(10,132,255,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Image background — muy oscurecida, solo textura */}
      {tournament.image_url && (
        <div className="absolute inset-0">
          <img
            src={tournament.image_url}
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05080b]/60 via-[#05080b]/80 to-[#05080b]" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 flex flex-col items-center text-center gap-6">

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11.5px] font-semibold tracking-wider uppercase ${status.color} ${status.border} ${status.bg}`}
        >
          {status.dot && (
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.label === "En curso" ? "animate-pulse" : ""}`} />
          )}
          {status.label}
        </motion.div>

        {/* Tournament name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-bold text-white leading-[1.0] tracking-tight"
          style={{ fontSize: "clamp(40px, 8vw, 96px)" }}
        >
          {tournament.name}
        </motion.h1>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-[#707b86]"
        >
          {tournament.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {tournament.location}
            </span>
          )}
          {tournament.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {startDateLabel}
            </span>
          )}
          {tournament.teams_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {tournament.teams_count} equipos
            </span>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-3 mt-2"
        >
          <button
            onClick={() => scrollTo("posiciones")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-[#0a84ff] rounded-full hover:bg-[#2493ff] transition-all shadow-[0_2px_16px_rgba(10,132,255,0.3)]"
          >
            <Trophy className="w-3.5 h-3.5" />
            Ver Tabla
          </button>
          <button
            onClick={() => scrollTo("partidos")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-[#a7b0ba] border border-[#202830] rounded-full hover:bg-[#0a0f14] hover:text-white transition-all"
          >
            ⚽ Partidos
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-[#4d565f] mt-1"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>

      </div>
    </section>
  );
};
