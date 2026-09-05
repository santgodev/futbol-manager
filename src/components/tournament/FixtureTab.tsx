"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";

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
}

interface FixtureTabProps {
  matches: Match[];
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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#97CADB]/10 border border-[#97CADB]/25 text-[#97CADB] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
        Resultado oficial
      </span>
    );
  if (s === "LIVE" || s === "IN_PLAY" || s === "EN_JUEGO")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6E8EE]/20 border border-[#D6E8EE]/40 text-[#D6E8EE] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D6E8EE] animate-pulse" />
        En juego
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#97CADB]/50 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
      Programado
    </span>
  );
}

function getRoundLabel(match: Match): string {
  if (match.round_number != null) return `Ronda ${match.round_number}`;
  if (match.match_date) return match.match_date;
  return "Sin fecha";
}

export function FixtureTab({ matches }: FixtureTabProps) {
  const [search, setSearch] = useState("");
  const [collapsedRounds, setCollapsedRounds] = useState<Set<string>>(new Set());

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
    const numA = parseInt(a.replace("Ronda ", "")) || 0;
    const numB = parseInt(b.replace("Ronda ", "")) || 0;
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
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#018ABE] pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo, sede o grupo... (mín. 3 letras)"
          className="w-full bg-[#001B48] border border-[#018ABE]/30 rounded-full pl-9 pr-4 py-2.5 text-[12px] text-[#D6E8EE] placeholder:text-[#02457A] focus:outline-none focus:border-[#018ABE] transition-colors shadow-inner"
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
            className="rounded-[2rem] border border-[#018ABE]/30 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            style={{ background: "rgba(2,69,122,0.4)", backdropFilter: "blur(16px)" }}
          >
            {/* Round header */}
            <button
              onClick={() => toggleRound(roundKey)}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#001B48]/70 border-b border-[#018ABE]/30 hover:bg-[#001B48] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#018ABE] shadow-[0_0_8px_#018ABE]" />
                <span className="text-[13px] font-black uppercase tracking-[0.15em] text-white">
                  {roundKey}
                </span>
                <span className="text-[10px] text-[#97CADB] font-mono ml-1">
                  ({roundMatches.length} partidos)
                </span>
              </div>
              {isCollapsed ? (
                <ChevronDown size={16} className="text-[#018ABE]" />
              ) : (
                <ChevronUp size={16} className="text-[#018ABE]" />
              )}
            </button>

            {/* Table header */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#018ABE]/30">
                      <th className="py-2.5 px-6 text-[9px] text-[#97CADB] font-black uppercase tracking-widest text-left min-w-[120px]">
                        Detalles
                      </th>
                      <th className="py-2.5 px-3 text-[9px] text-[#97CADB] font-black uppercase tracking-widest text-left min-w-[80px]">
                        Grupo
                      </th>
                      <th className="py-2.5 px-3 text-[9px] text-[#97CADB] font-black uppercase tracking-widest text-left">
                        Partido y Sets
                      </th>
                      <th className="py-2.5 px-6 text-[9px] text-[#97CADB] font-black uppercase tracking-widest text-right min-w-[130px]">
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
                          className="border-b border-[#018ABE]/10 last:border-0 hover:bg-[#001B48]/50 transition-colors"
                        >
                          {/* Detalles: fecha, hora, cancha */}
                          <td className="py-3.5 px-6 align-top">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-mono text-[#D6E8EE] whitespace-nowrap">
                                {formatDate(match.match_date)}{" "}
                                {formatTime(match.match_time)
                                  ? formatTime(match.match_time)
                                  : ""}
                              </span>
                              {match.venue && (
                                <span className="flex items-center gap-1 text-[10px] text-[#018ABE]">
                                  <MapPin size={9} />
                                  {match.venue}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Grupo */}
                          <td className="py-3.5 px-3 align-middle">
                            {match.group_name ? (
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#018ABE]">
                                Grupo {match.group_name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#97CADB]/50">—</span>
                            )}
                          </td>

                          {/* Partido y Sets */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="flex flex-col gap-1.5 min-w-[260px]">
                              {/* Home row */}
                              <div className="flex items-center gap-3 bg-[#001B48]/50 px-3 py-2 rounded-full border border-[#018ABE]/10">
                                <span
                                  className={`text-[11px] font-black uppercase tracking-wider flex-1 ${
                                    homeWon
                                      ? "text-white"
                                      : isFinished
                                      ? "text-[#97CADB]"
                                      : "text-[#D6E8EE]"
                                  }`}
                                >
                                  {match.home_team?.name || "TBD"}
                                </span>
                                <span
                                  className={`text-[13px] font-black font-mono min-w-[18px] text-center ${
                                    homeWon
                                      ? "text-[#D6E8EE]"
                                      : isFinished
                                      ? "text-[#97CADB]"
                                      : "text-[#97CADB]"
                                  }`}
                                >
                                  {homeScore !== null ? homeScore : "—"}
                                </span>
                                <span className="text-[#018ABE] text-[10px] font-bold">:</span>
                                <span
                                  className={`text-[13px] font-black font-mono min-w-[18px] text-center ${
                                    awayWon
                                      ? "text-[#D6E8EE]"
                                      : isFinished
                                      ? "text-[#97CADB]"
                                      : "text-[#97CADB]"
                                  }`}
                                >
                                  {awayScore !== null ? awayScore : "—"}
                                </span>
                                <span
                                  className={`text-[11px] font-black uppercase tracking-wider flex-1 text-right ${
                                    awayWon
                                      ? "text-white"
                                      : isFinished
                                      ? "text-[#97CADB]"
                                      : "text-[#D6E8EE]"
                                  }`}
                                >
                                  {match.away_team?.name || "TBD"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-6 align-middle text-right">
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
    </div>
  );
}
