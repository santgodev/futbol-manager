"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Shield } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

type CalendarTab = "ALL" | "GROUP" | "KNOCKOUT";

const KNOCKOUT_STAGES = ["ROUND_32", "ROUND_16", "QUARTERFINAL", "SEMIFINAL", "FINAL", "THIRD_PLACE"];

function stageLabel(stage: string, roundNumber?: number | null): string {
  switch (stage) {
    case "GROUP": return roundNumber ? `Jornada ${roundNumber}` : "Fase de Grupos";
    case "ROUND_32": return "Ronda de 32";
    case "ROUND_16": return "Octavos de Final";
    case "QUARTERFINAL": return "Cuartos de Final";
    case "SEMIFINAL": return "Semifinal";
    case "FINAL": return "Gran Final";
    case "THIRD_PLACE": return "Tercer Puesto";
    default: return stage;
  }
}

export const TournamentCalendar = ({ matches }: { matches: any[] }) => {
  const [activeTab, setActiveTab] = useState<CalendarTab>("ALL");
  const [selectedRound, setSelectedRound] = useState<number | "ALL">("ALL");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);

  if (!matches || matches.length === 0) return null;

  const hasGroupMatches = matches.some(m => m.stage === "GROUP");
  const hasKnockoutMatches = matches.some(m => KNOCKOUT_STAGES.includes(m.stage));

  const tabFilteredMatches = activeTab === "GROUP"
    ? matches.filter(m => m.stage === "GROUP")
    : activeTab === "KNOCKOUT"
    ? matches.filter(m => KNOCKOUT_STAGES.includes(m.stage))
    : matches;

  const uniqueRounds = activeTab !== "KNOCKOUT"
    ? Array.from(new Set(
        matches
          .filter(m => m.stage === "GROUP")
          .map((m: any) => m.round_number)
          .filter(Boolean)
      )).sort((a: any, b: any) => a - b)
    : [];

  const filteredMatches = (activeTab === "GROUP" || activeTab === "ALL") && selectedRound !== "ALL"
    ? tabFilteredMatches.filter((m: any) => m.round_number === selectedRound)
    : tabFilteredMatches;

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const date = match.match_date || "Por definir";
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
    if (a === "Por definir" && b === "Por definir") return 0;
    if (a === "Por definir") return -1;
    if (b === "Por definir") return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // For visual calendar
  const matchDates = useMemo(() => {
    const dates: Date[] = [];
    filteredMatches.forEach((m: any) => {
      if (m.match_date && m.match_date !== "Por definir") {
        dates.push(new Date(m.match_date + "T00:00:00")); // Force local timezone interpretation
      }
    });
    return dates;
  }, [filteredMatches]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINISHED":
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-full">Finalizado</span>;
      case "LIVE":
      case "IN_PLAY":
        return <span className="px-3 py-1 bg-red-500/15 border border-red-500/40 text-red-400 text-[9px] font-black uppercase tracking-wider rounded-full animate-pulse">En Vivo</span>;
      default:
        return <span className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff]/60 text-[9px] font-black uppercase tracking-wider rounded-full">Programado</span>;
    }
  };

  const formatDate = (rawDate: string) => {
    if (rawDate === "Por definir") return "Fechas por definir";
    try {
      // Force local timezone interpretation to prevent "2026-05-22" shifting to "21" in UTC-5
      const d = new Date(rawDate + "T00:00:00");
      if (isNaN(d.getTime())) return rawDate;
      return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
    } catch {
      return rawDate;
    }
  };

  const TabButton = ({ tab, label }: { tab: CalendarTab; label: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setSelectedRound("ALL"); }}
      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer shrink-0 ${
        activeTab === tab
          ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          : "bg-[#02060d]/60 border-[#0055cc]/15 text-white/40 hover:border-[#0055cc]/40 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section id="calendar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      <div className="flex flex-col gap-6 mb-12 pb-6 border-b border-[#0055cc]/20 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Calendario Oficial</h2>
              <p className="text-[10px] font-mono text-[#00f0ff]/60 uppercase tracking-widest mt-1">Encuentros y Resultados</p>
            </div>
          </div>
        </div>

        {uniqueRounds.length > 0 && activeTab !== "KNOCKOUT" && (
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setSelectedRound("ALL")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                selectedRound === "ALL" ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40" : "bg-[#02060d]/60 border-[#0055cc]/15 text-white/40"
              }`}
            >
              Todas las Jornadas
            </button>
            {uniqueRounds.map((roundNum: any) => (
              <button
                key={roundNum}
                onClick={() => setSelectedRound(roundNum)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                  selectedRound === roundNum ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40" : "bg-[#02060d]/60 border-[#0055cc]/15 text-white/40"
                }`}
              >
                Jornada {roundNum}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Botón para mostrar/ocultar calendario en móviles */}
        <div className="lg:hidden flex justify-center -mb-4 z-10">
          <button 
            onClick={() => setShowMobileCalendar(!showMobileCalendar)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#001122]/90 backdrop-blur-md border border-[#00f0ff]/30 rounded-full text-[10px] font-black text-[#00f0ff] uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all hover:bg-[#00f0ff]/10"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {showMobileCalendar ? "Ocultar Calendario" : "Ver Calendario Visual"}
          </button>
        </div>

        {/* Visual Calendar Sidebar */}
        <div className={`w-full lg:w-[350px] shrink-0 ${showMobileCalendar ? "block" : "hidden"} lg:block`}>
          <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/20 rounded-2xl p-6 lg:sticky lg:top-28">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#00f0ff]" />
              Calendario Visual
            </h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d);
                  if (d) {
                    // Extract local YYYY-MM-DD safely instead of toISOString() which shifts in UTC+
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    
                    const id = `date-${dateStr}`;
                    const el = document.getElementById(id);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }
                }}
                modifiers={{ hasMatch: matchDates }}
                modifiersClassNames={{ 
                  hasMatch: "font-black text-white relative after:content-[''] after:absolute after:bottom-[3px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#00f0ff] after:shadow-[0_0_4px_#00f0ff]" 
                }}
                className="bg-transparent text-white border-none p-0 w-full flex justify-center [&_.rdp-caption_label]:text-[#00f0ff] [&_.rdp-caption_label]:font-black [&_.rdp-caption_label]:tracking-widest [&_.rdp-nav_button]:text-[#00f0ff] [&_.rdp-nav_button:hover]:bg-[#00f0ff]/10 [&_.rdp-head_cell]:text-[#00f0ff]/70 [&_.rdp-day_selected]:bg-[#00f0ff] [&_.rdp-day_selected]:text-[#001122] [&_.rdp-day_selected]:font-black [&_.rdp-button:hover:not([disabled]):not(.rdp-day_selected)]:bg-[#00f0ff]/10 [&_.rdp-button:hover:not([disabled]):not(.rdp-day_selected)]:text-[#00f0ff]"
              />
            </div>
            <div className="mt-6 flex flex-col gap-2 text-xs text-white/50 uppercase tracking-widest font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]"></div>
                <span>Días con partidos</span>
              </div>
            </div>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(undefined)}
                className="mt-4 w-full py-2 text-xs font-bold text-[#00f0ff]/70 hover:text-[#00f0ff] uppercase tracking-widest transition-colors border border-transparent hover:border-[#00f0ff]/20 rounded-lg"
              >
                Limpiar Selección
              </button>
            )}
          </div>
        </div>

        {/* Matches List */}
        <div className="flex-1 max-w-4xl flex flex-col gap-10">
        <AnimatePresence mode="wait">
          <motion.div key={`${activeTab}-${selectedRound}`} initial={{ y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="flex flex-col gap-10">
            {sortedDates.length === 0 ? (
              <div className="text-center py-16 text-white/40 text-sm font-mono uppercase tracking-widest">No hay partidos en esta selección</div>
            ) : (
              sortedDates.map((dateKey) => {
                const dayMatches = groupedMatches[dateKey];
                return (
                  <div key={dateKey} id={`date-${dateKey}`} className="flex flex-col gap-4 scroll-mt-24">
                    <div className="my-4 py-3 px-4 bg-gradient-to-r from-[#001122]/95 via-[#001122]/80 to-transparent border-l-4 border-[#00f0ff] rounded-r-2xl backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full animate-pulse" />
                        <span className="text-xs md:text-sm font-black uppercase tracking-[0.15em] text-[#00f0ff]">{formatDate(dateKey)}</span>
                      </div>
                      <span className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#00f0ff] text-[9px] font-black rounded-full">{dayMatches.length} PARTIDOS</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {dayMatches.map((match: any) => {
                        const isFinished = match.status === "FINISHED";
                        const isScheduled = match.status === "SCHEDULED";
                        const isLive = match.status === "LIVE" || match.status === "IN_PLAY";
                        const showScore = !isScheduled && match.home_score !== null && match.away_score !== null;
                        const homeWins = showScore && (match.home_score || 0) > (match.away_score || 0);
                        const awayWins = showScore && (match.away_score || 0) > (match.home_score || 0);
                        return (
                          <div key={match.id} className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#00f0ff]/30">
                            <div className="flex items-center gap-3 md:w-36 shrink-0 border-b md:border-b-0 md:border-r border-[#0055cc]/10 pb-3 md:pb-0">
                              <CalendarIcon className="w-3.5 h-3.5 text-[#00f0ff]/50" />
                              <div className="flex flex-col">
                                <span className="text-white font-bold font-mono text-xs">{match.match_time ? match.match_time.substring(0, 5) : "TBD"}</span>
                                <span className="text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-wider">{stageLabel(match.stage, match.round_number)}</span>
                              </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center gap-3 py-2">
                              <div className="flex-1 flex items-center justify-end gap-3 text-right">
                                <span className={`text-xs md:text-sm font-black uppercase ${isFinished && !homeWins ? "text-white/40" : "text-white"}`}>{match.home_team?.name}</span>
                                <div className="w-8 h-8 rounded-lg bg-[#001122]/60 border border-white/5 flex items-center justify-center">
                                  {match.home_team?.logo_url ? <img src={match.home_team.logo_url} alt="Local" className="object-contain p-1" /> : <Shield className="w-4 h-4 text-[#0055cc]/30" />}
                                </div>
                              </div>
                              <div className={`flex items-center justify-center gap-2 px-4 py-1.5 border rounded-xl min-w-[70px] ${isLive ? "bg-red-950/50 border-red-500/30" : "bg-[#001122]/90 border-[#0055cc]/30"}`}>
                                {showScore ? (
                                  <>
                                    <span className={`text-sm font-black font-mono ${homeWins ? "text-[#00f0ff]" : "text-white/70"}`}>{match.home_score}</span>
                                    <span className="text-white/20 font-bold text-[10px]">-</span>
                                    <span className={`text-sm font-black font-mono ${awayWins ? "text-[#00f0ff]" : "text-white/70"}`}>{match.away_score}</span>
                                  </>
                                ) : (
                                  <span className={`text-[10px] font-black tracking-widest uppercase font-mono ${isLive ? "text-red-400 animate-pulse" : "text-[#00f0ff]"}`}>{isLive ? "EN VIVO" : "VS"}</span>
                                )}
                              </div>
                              <div className="flex-1 flex items-center justify-start gap-3 text-left">
                                <div className="w-8 h-8 rounded-lg bg-[#001122]/60 border border-white/5 flex items-center justify-center">
                                  {match.away_team?.logo_url ? <img src={match.away_team.logo_url} alt="Visitante" className="object-contain p-1" /> : <Shield className="w-4 h-4 text-[#0055cc]/30" />}
                                </div>
                                <span className={`text-xs md:text-sm font-black uppercase ${isFinished && !awayWins ? "text-white/40" : "text-white"}`}>{match.away_team?.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end md:w-28 shrink-0">{getStatusBadge(match.status)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
