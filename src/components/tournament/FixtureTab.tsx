"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Clock, ChevronDown, ChevronUp, X, Goal } from "lucide-react";
import { formatVolleyballSets, type VolleyballSet } from "@/utils/volleyball";

interface Match {
  id: string;
  match_date: string | null;
  match_time: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  stage: string;
  round_number: number | null;
  home_team?: { name: string; logo_url?: string | null } | null;
  away_team?: { name: string; logo_url?: string | null } | null;
  group_name?: string | null;
  venue?: string | null;
  bracket_order?: number | null;
  match_sets?: VolleyballSet[] | null;
  match_events?: any[];
  home_team_id?: string;
  away_team_id?: string;
}

interface FixtureTabProps {
  matches: Match[];
  onTeamClick?: (teamId: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  return timeStr.substring(0, 5);
}

function statusBadge(status: string | null) {
  const s = (status || "").toUpperCase();
  if (s === "FINISHED" || s === "FINALIZADO" || s === "RESULTADO_OFICIAL")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
        Finalizado
      </span>
    );
  if (s === "LIVE" || s === "IN_PLAY" || s === "EN_JUEGO")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
        En juego
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
      Programado
    </span>
  );
}

function getRoundLabel(match: Match): string {
  if (match.round_number != null) return `Jornada ${match.round_number}`;
  if (match.match_date) return match.match_date;
  return "Sin fecha";
}

export function FixtureTab({ matches, onTeamClick }: FixtureTabProps) {
  const [search, setSearch] = useState("");
  const [collapsedRounds, setCollapsedRounds] = useState<Set<string>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const groupMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered =
      q.length >= 3
        ? matches.filter((m) => {
            const homeName = (m.home_team?.name || "").toLowerCase();
            const awayName = (m.away_team?.name || "").toLowerCase();
            const group = (m.group_name || "").toLowerCase();
            const venue = (m.venue || "").toLowerCase();
            return (
              homeName.includes(q) ||
              awayName.includes(q) ||
              group.includes(q) ||
              venue.includes(q)
            );
          })
        : matches;

    // Group by round
    const rounds: Record<string, Match[]> = {};
    for (const m of filtered) {
      const label = getRoundLabel(m);
      if (!rounds[label]) rounds[label] = [];
      rounds[label].push(m);
    }
    // Sort each round's matches by date + time + bracket_order
    for (const key of Object.keys(rounds)) {
      rounds[key].sort((a, b) => {
        const dateA = `${a.match_date ?? ""}${a.match_time ?? ""}`;
        const dateB = `${b.match_date ?? ""}${b.match_time ?? ""}`;
        if (dateA !== dateB) return dateA < dateB ? -1 : 1;
        return (a.bracket_order ?? 0) - (b.bracket_order ?? 0);
      });
    }
    return rounds;
  }, [matches, search]);

  const roundKeys = Object.keys(groupMatches).sort((a, b) => {
    const numA = parseInt(a.replace("Jornada ", "")) || 0;
    const numB = parseInt(b.replace("Jornada ", "")) || 0;
    if (numA && numB) return numA - numB;
    return a < b ? -1 : 1;
  });

  const toggleRound = (key: string) => {
    setCollapsedRounds((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00f0ff]/40 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo, sede o grupo... (mín. 3 letras)"
          className="w-full bg-[#0a1122]/80 border border-[#00f0ff]/10 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white/80 placeholder-white/25 focus:outline-none focus:border-[#00f0ff]/40 transition-colors"
        />
      </div>

      {/* No results */}
      {roundKeys.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm">
          {search.length >= 3
            ? "No se encontraron partidos para tu búsqueda."
            : "No hay partidos disponibles."}
        </div>
      )}

      {/* Rounds */}
      {roundKeys.map((roundKey) => {
        const roundMatches = groupMatches[roundKey];
        const isCollapsed = collapsedRounds.has(roundKey);

        return (
          <div
            key={roundKey}
            className="rounded-2xl border border-[#00f0ff]/10 overflow-hidden"
            style={{ background: "rgba(5,8,17,0.85)", backdropFilter: "blur(16px)" }}
          >
            {/* Round header */}
            <button
              onClick={() => toggleRound(roundKey)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#0a1526]/70 border-b border-[#00f0ff]/10 hover:bg-[#0a1526] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                <span className="text-[13px] font-black uppercase tracking-[0.15em] text-white">
                  {roundKey}
                </span>
                <span className="text-[10px] text-white/30 font-mono ml-1">
                  ({roundMatches.length} partidos)
                </span>
              </div>
              {isCollapsed ? (
                <ChevronDown size={16} className="text-[#00f0ff]/50" />
              ) : (
                <ChevronUp size={16} className="text-[#00f0ff]/50" />
              )}
            </button>

            {/* Table header */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="py-2.5 px-4 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest text-left min-w-[120px]">
                        Detalles
                      </th>
                      <th className="py-2.5 px-3 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest text-left min-w-[80px]">
                        Grupo
                      </th>
                      <th className="py-2.5 px-3 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest text-left">
                        Resultado
                      </th>
                      <th className="py-2.5 px-4 text-[9px] text-[#00f0ff]/50 font-black uppercase tracking-widest text-right min-w-[130px]">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundMatches.map((match) => {
                      const isFinished =
                        (match.status || "").toUpperCase() === "FINISHED" ||
                        (match.status || "").toUpperCase() === "FINALIZADO";
                      const homeScore = match.home_score;
                      const awayScore = match.away_score;
                      const setLine = formatVolleyballSets(match.match_sets);
                      const homeWon =
                        homeScore !== null &&
                        awayScore !== null &&
                        homeScore > awayScore;
                      const awayWon =
                        homeScore !== null &&
                        awayScore !== null &&
                        awayScore > homeScore;

                      return (
                        <tr
                          key={match.id}
                          onClick={() => setSelectedMatch(match)}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] cursor-pointer transition-colors"
                        >
                          {/* Detalles: fecha, hora, cancha */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-mono text-white/70 whitespace-nowrap">
                                {formatDate(match.match_date)}{" "}
                                {formatTime(match.match_time)
                                  ? formatTime(match.match_time)
                                  : ""}
                              </span>
                              {match.venue && (
                                <span className="flex items-center gap-1 text-[10px] text-[#00f0ff]/60">
                                  <MapPin size={9} />
                                  {match.venue}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Grupo */}
                          <td className="py-3.5 px-3 align-middle">
                            {match.group_name ? (
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#00f0ff]/70">
                                Grupo {match.group_name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-white/20">—</span>
                            )}
                          </td>

                          {/* Resultado */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="flex flex-col gap-1.5 min-w-[260px]">
                              {/* Home row */}
                              <div className="flex items-center gap-3">
                                <span
                                  onClick={(e) => {
                                    if (onTeamClick && match.home_team_id) {
                                      e.stopPropagation();
                                      onTeamClick(match.home_team_id);
                                    }
                                  }}
                                  className={`text-[11px] font-black uppercase tracking-wider flex-1 ${onTeamClick ? "cursor-pointer hover:text-[#00f0ff] transition-colors" : ""} ${
                                    homeWon
                                      ? "text-white"
                                      : isFinished
                                      ? "text-white/40"
                                      : "text-white/80"
                                  }`}
                                >
                                  {match.home_team?.name || "TBD"}
                                </span>
                                <span
                                  className={`text-[13px] font-black font-mono min-w-[18px] text-center ${
                                    homeWon
                                      ? "text-white"
                                      : isFinished
                                      ? "text-white/30"
                                      : "text-white/50"
                                  }`}
                                >
                                  {homeScore !== null ? homeScore : "—"}
                                </span>
                                <span className="text-white/20 text-[10px] font-bold">:</span>
                                <span
                                  className={`text-[13px] font-black font-mono min-w-[18px] text-center ${
                                    awayWon
                                      ? "text-white"
                                      : isFinished
                                      ? "text-white/30"
                                      : "text-white/50"
                                  }`}
                                >
                                  {awayScore !== null ? awayScore : "—"}
                                </span>
                                <span
                                  onClick={(e) => {
                                    if (onTeamClick && match.away_team_id) {
                                      e.stopPropagation();
                                      onTeamClick(match.away_team_id);
                                    }
                                  }}
                                  className={`text-[11px] font-black uppercase tracking-wider flex-1 text-right ${onTeamClick ? "cursor-pointer hover:text-[#00f0ff] transition-colors" : ""} ${
                                    awayWon
                                      ? "text-white"
                                      : isFinished
                                      ? "text-white/40"
                                      : "text-white/80"
                                  }`}
                                >
                                  {match.away_team?.name || "TBD"}
                                </span>
                              </div>
                              {setLine && (
                                <span className="text-[10px] font-mono text-[#00f0ff]/55 uppercase tracking-wider">
                                  Sets: {setLine}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-4 align-middle text-right">
                            {statusBadge(match.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}>
          <div className="bg-[#050811] border border-[#00f0ff]/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md max-h-[80vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white font-black uppercase tracking-wider text-sm flex items-center gap-2">
                Resumen del Partido
              </h3>
              <button onClick={() => setSelectedMatch(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-8 bg-white/5 rounded-xl p-4 border border-white/10">
               <div className="flex-1 text-center font-black text-white uppercase text-sm truncate px-1 leading-tight">{selectedMatch.home_team?.name || "Local"}</div>
               <div className="text-3xl font-black text-[#00f0ff] px-4 font-mono tracking-tighter">
                 {selectedMatch.home_score !== null ? selectedMatch.home_score : '-'} 
                 <span className="text-white/20 mx-1">:</span> 
                 {selectedMatch.away_score !== null ? selectedMatch.away_score : '-'}
               </div>
               <div className="flex-1 text-center font-black text-white uppercase text-sm truncate px-1 leading-tight">{selectedMatch.away_team?.name || "Visitante"}</div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-black border-b border-[#00f0ff]/20 pb-2">Goles y Eventos Registrados</h4>
              {(!selectedMatch.match_events || selectedMatch.match_events.length === 0) ? (
                <div className="text-center py-8 text-white/30 text-xs font-mono uppercase tracking-widest border border-dashed border-white/10 rounded-xl bg-white/5">
                  No hay anotaciones registradas
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedMatch.match_events.map((ev: any) => {
                     const isHome = ev.team_id === selectedMatch.home_team_id;
                     const isAway = ev.team_id === selectedMatch.away_team_id;
                     const teamName = isHome ? selectedMatch.home_team?.name : (isAway ? selectedMatch.away_team?.name : 'Equipo');
                     
                     let evName = "GOL";
                     let evIcon = <Goal size={14} />;
                     let colorClass = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
                     if (ev.type === 'YELLOW_CARD') { evName = "AMARILLA"; evIcon = <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />; colorClass = "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"; }
                     if (ev.type === 'RED_CARD') { evName = "ROJA"; evIcon = <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />; colorClass = "text-red-400 border-red-500/30 bg-red-500/10"; }
                     
                     return (
                        <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${colorClass} ${isAway ? 'flex-row-reverse text-right' : ''}`}>
                           <div className={`flex items-center justify-center`}>
                             {evIcon}
                           </div>
                           <div className="flex-1">
                              <div className="text-xs font-black text-white uppercase tracking-wider">{ev.player?.name || ev.description || 'Jugador Desconocido'}</div>
                              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{teamName}</div>
                           </div>
                        </div>
                     )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
