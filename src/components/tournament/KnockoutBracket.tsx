"use client";

import { useState } from "react";
import { Shield } from "@/components/ui/Shield";
import { Trophy, GitMerge, List } from "lucide-react";

interface KnockoutBracketProps {
  matches: any[];
  totalTeams?: number;
}

/** Mínimo de equipos requeridos para cada stage */
const MIN_TEAMS_FOR_STAGE: Record<string, number> = {
  ROUND_32: 32,
  ROUND_16: 16,
  QUARTERFINAL: 8,
  SEMIFINAL: 4,
  FINAL: 2,
};

const STAGE_ORDER = ["ROUND_32", "ROUND_16", "QUARTERFINAL", "SEMIFINAL", "FINAL", "THIRD_PLACE"];
const STAGE_LABELS: Record<string, string> = {
  ROUND_32: "Ronda de 32",
  ROUND_16: "Octavos de Final",
  QUARTERFINAL: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  FINAL: "Gran Final",
  THIRD_PLACE: "Tercer Puesto",
};


export const getTheme = (cupName: string) => {
  const name = (cupName || "").toLowerCase();
  if (name.includes("oro")) {
    return {
      primary: "text-[#ffaa00]",
      bg: "bg-[#ffaa00]",
      bg10: "bg-[#ffaa00]/10",
      bg20: "bg-[#ffaa00]/20",
      border: "border-[#ffaa00]/20",
      border80: "border-[#ffaa00]/80",
      borderSolid: "border-[#ffaa00]",
      glow: "drop-shadow-[0_0_8px_rgba(255,170,0,0.6)]",
      glowText: "drop-shadow-[0_0_15px_rgba(255,170,0,0.4)]",
      shadow: "shadow-[0_0_20px_rgba(255,170,0,0.3)]",
      hoverShadow: "hover:shadow-[0_0_20px_rgba(255,170,0,0.3)]",
      from: "from-[#ffaa00]",
      to50: "to-[#ffaa00]/50",
      finalLabel: "bg-gradient-to-r from-[#ffaa00]/80 via-[#ffaa00] to-[#ffaa00]/80 text-[#050810]",
      finalBorder: "border-[#ffaa00]/60",
      finalShadow: "shadow-[0_0_25px_rgba(255,170,0,0.2)]",
      finalHoverBorder: "hover:border-[#ffaa00]",
      finalHoverShadow: "hover:shadow-[0_0_35px_rgba(255,170,0,0.4)]",
      finalHeader: "text-[#ffaa00]"
    };
  } else if (name.includes("plata")) {
    return {
      primary: "text-[#a7b0ba]",
      bg: "bg-[#a7b0ba]",
      bg10: "bg-[#a7b0ba]/10",
      bg20: "bg-[#a7b0ba]/20",
      border: "border-[#a7b0ba]/20",
      border80: "border-[#a7b0ba]/80",
      borderSolid: "border-[#a7b0ba]",
      glow: "drop-shadow-[0_0_8px_rgba(167,176,186,0.6)]",
      glowText: "drop-shadow-[0_0_15px_rgba(167,176,186,0.4)]",
      shadow: "shadow-[0_0_20px_rgba(167,176,186,0.3)]",
      hoverShadow: "hover:shadow-[0_0_20px_rgba(167,176,186,0.3)]",
      from: "from-[#a7b0ba]",
      to50: "to-[#a7b0ba]/50",
      finalLabel: "bg-gradient-to-r from-[#a7b0ba]/80 via-[#a7b0ba] to-[#a7b0ba]/80 text-[#050810]",
      finalBorder: "border-[#a7b0ba]/60",
      finalShadow: "shadow-[0_0_25px_rgba(167,176,186,0.2)]",
      finalHoverBorder: "hover:border-[#a7b0ba]",
      finalHoverShadow: "hover:shadow-[0_0_35px_rgba(167,176,186,0.4)]",
      finalHeader: "text-[#a7b0ba]"
    };
  } else {
    return {
      primary: "text-[#00f0ff]",
      bg: "bg-[#00f0ff]",
      bg10: "bg-[#00f0ff]/10",
      bg20: "bg-[#00f0ff]/20",
      border: "border-[#00f0ff]/20",
      border80: "border-[#00f0ff]/80",
      borderSolid: "border-[#00f0ff]",
      glow: "drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]",
      glowText: "drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]",
      shadow: "shadow-[0_0_20px_rgba(0,240,255,0.3)]",
      hoverShadow: "hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]",
      from: "from-[#00f0ff]",
      to50: "to-[#00f0ff]/50",
      finalLabel: "bg-gradient-to-r from-[#f59e0b]/80 via-[#f59e0b] to-[#f59e0b]/80 text-[#050810]",
      finalBorder: "border-[#f59e0b]/60",
      finalShadow: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
      finalHoverBorder: "hover:border-[#f59e0b]",
      finalHoverShadow: "hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]",
      finalHeader: "text-[#f59e0b]"
    };
  }
};

function statusBadge(status: string | null) {
  const s = (status || "").toUpperCase();
  if (s === "FINISHED" || s === "FINALIZADO")
    return <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">FINAL</span>;
  if (s === "LIVE" || s === "IN_PLAY")
    return (
      <span className="flex items-center gap-1 text-[8px] font-bold text-[#00f0ff] uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
        VIVO
      </span>
    );
  return <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">PROG.</span>;
}

export function KnockoutBracket({ matches, totalTeams = 0 }: KnockoutBracketProps) {
  const [view, setView] = useState<"tree" | "rounds">("tree");

  // Group by cup_name
  const knockoutMatches = matches.filter(m => m.is_knockout || m.stage === "FINAL" || m.stage === "SEMIFINAL" || m.stage === "QUARTERFINAL" || m.stage === "ROUND_16" || m.stage === "ROUND_32" || m.stage === "THIRD_PLACE");
  const cups = Array.from(new Set(knockoutMatches.map(m => m.cup_name || "Copa Principal")));

  const hasKnockoutMatches = knockoutMatches.length > 0;

  const isStructurallyValid = true; // Relaxing this strict check for dynamic cups

  // No knockout matches at all
  if (!hasKnockoutMatches) {
    return (
      <div className="w-full relative rounded-3xl p-12 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1526]/80 to-[#050810]/95 backdrop-blur-xl border border-[#00f0ff]/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_15px_#00f0ff] opacity-80 group-hover:w-1/2 transition-all duration-700" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[120px] bg-[#00f0ff]/10 blur-[50px] pointer-events-none" />
        <div className="w-20 h-24 mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00f0ff]/20 blur-[20px] rounded-full animate-pulse" />
          <Shield className="w-16 h-20 text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] relative z-10" />
        </div>
        <h3 className="text-white font-black uppercase tracking-widest text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          Fase Final No Definida
        </h3>
        <p className="text-[#00f0ff]/60 text-[11px] font-mono uppercase tracking-[0.2em] mt-3 text-center max-w-md font-bold">
          Los cruces eliminatorios se revelarán una vez que concluya la fase de grupos.
        </p>
      </div>
    );
  }

  if (!isStructurallyValid) {
    return (
      <div className="w-full glass-panel p-12 flex flex-col items-center justify-center border-amber-500/20">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <span className="text-xl">⚙️</span>
        </div>
        <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm">
          Eliminatorias en Configuración
        </h3>
        <p className="text-brand-text-muted text-[10px] font-mono uppercase tracking-widest mt-2 text-center max-w-sm">
          El formato eliminatorio está siendo configurado. Los cruces se publicarán pronto.
        </p>
      </div>
    );
  }

  // ── Match Node (tree view) ──────────────────────────────────────────
  const MatchNode = ({ match, isFinal = false, cupName = "" }: { match?: any; isFinal?: boolean; cupName?: string }) => {
    const theme = getTheme(cupName);
    if (!match) {
      return (
        <div className="flex flex-col w-full bg-[#0a1526]/40 border border-white/5 rounded-xl h-[90px] justify-center px-4 relative group transition-all duration-300">
          <div className="flex justify-between items-center text-white/20 uppercase tracking-widest text-[10px] mb-2 font-bold font-mono">
            <span>Por Definir</span>
            <span>—</span>
          </div>
          <div className="flex justify-between items-center text-white/20 uppercase tracking-widest text-[10px] font-bold font-mono">
            <span>Por Definir</span>
            <span>—</span>
          </div>
        </div>
      );
    }

    const isMatchScheduled = match.status === "SCHEDULED" || match.status === "PRÓXIMO";
    const homeScore = isMatchScheduled ? null : (match.home_score ?? null);
    const awayScore = isMatchScheduled ? null : (match.away_score ?? null);
    const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
    const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;

    return (
      <div
        className={`flex flex-col w-full bg-[#0a1526]/80 backdrop-blur-sm rounded-xl relative group overflow-hidden transition-all duration-300 ${
          isFinal
            ? "border-[2px] " + theme.finalBorder + " " + theme.finalShadow + " " + theme.finalHoverBorder + " " + theme.finalHoverShadow + " hover:-translate-y-1"
            : "border " + theme.border + " " + theme.border80 + " " + theme.hoverShadow + " hover:-translate-y-1"
        }`}
      >
        {isFinal && (
          <div className={`absolute top-0 left-0 w-full ${theme.finalLabel} text-[9px] font-black uppercase tracking-[0.2em] text-center py-1 shadow-md select-none z-10`}>
            Gran Final
          </div>
        )}

        <div className={`flex justify-between items-center px-4 py-3 border-b border-white/5 relative z-0 ${isFinal ? "mt-5" : ""}`}>
          {homeWon && <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg}`} />}
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield
              className={`w-5 h-6 ${homeWon ? theme.primary + " " + theme.glow : theme.primary.replace("text-", "text-").split(' ')[0] + "/20"}`}
            />
            <span
              className={`text-[13px] font-bold uppercase tracking-wider truncate ${
                homeWon ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "text-white/40"
              }`}
            >
              {match.home_team?.name || "TBD"}
            </span>
          </div>
          <span
            className={`text-lg font-black font-mono ${homeWon ? theme.primary + " " + theme.glow : "text-white/40"}`}
          >
            {homeScore !== null ? homeScore : "—"}
          </span>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-white/[0.02] relative z-0">
          {awayWon && <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg}`} />}
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield
              className={`w-5 h-6 ${awayWon ? theme.primary + " " + theme.glow : theme.primary.replace("text-", "text-").split(' ')[0] + "/20"}`}
            />
            <span
              className={`text-[13px] font-bold uppercase tracking-wider truncate ${
                awayWon ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" : "text-white/40"
              }`}
            >
              {match.away_team?.name || "TBD"}
            </span>
          </div>
          <span
            className={`text-lg font-black font-mono ${awayWon ? theme.primary + " " + theme.glow : "text-white/40"}`}
          >
            {awayScore !== null ? awayScore : "—"}
          </span>
        </div>

        {match.home_penalty_score !== null && match.away_penalty_score !== null && (
          <div className="w-full text-[10px] text-center ${theme.bg}/10 text-[#00f0ff] py-1.5 uppercase tracking-widest font-mono font-bold border-t border-[#00f0ff]/20">
            PEN: {match.home_penalty_score} - {match.away_penalty_score}
          </div>
        )}
      </div>
    );
  };

  // ── Rounds view ────────────────────────────────────────────────────
  const RoundsView = ({ cupMatches }: { cupMatches: any[] }) => {
    const cupName = cupMatches[0]?.cup_name || "";
    const theme = getTheme(cupName);
    const getMatchesByStage = (stage: string) => cupMatches.filter((m) => m.stage === stage);
    const roundsWithMatches = STAGE_ORDER.filter((stage) => {
      const stageMatches = getMatchesByStage(stage);
      return stageMatches.length > 0;
    });

    return (
      <div className="space-y-6">
        {roundsWithMatches.map((stage) => {
          const stageMatches = getMatchesByStage(stage);
          return (
            <div
              key={stage}
              className="rounded-2xl border ${theme.border} overflow-hidden"
              style={{ background: "rgba(5,8,17,0.85)" }}
            >
              <div className="flex items-center gap-2 px-5 py-3.5 border-b ${theme.border} bg-[#0a1526]/70">
                <span
                  className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                    stage === "FINAL" ? "${theme.finalHeader}" : `${theme.primary}`
                  }`}
                >
                  {STAGE_LABELS[stage] || stage}
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {stageMatches.map((match) => {
                  const isScheduled = match.status === "SCHEDULED" || match.status === "PRÓXIMO";
                  const homeScore = isScheduled ? null : match.home_score;
                  const awayScore = isScheduled ? null : match.away_score;
                  const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
                  const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;

                  return (
                    <div key={match.id} className="flex items-center px-5 py-3.5 gap-4 hover:bg-white/[0.02] transition-colors">
                      {/* Date/time */}
                      <div className="flex flex-col gap-0.5 w-24 shrink-0">
                        <span className="text-[10px] font-mono text-white/50">{match.match_date ?? "—"}</span>
                        <span className="text-[10px] font-mono text-white/30">
                          {match.match_time ? match.match_time.substring(0, 5) : ""}
                        </span>
                      </div>

                      {/* Teams + score */}
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <span className={`text-[11px] font-bold uppercase tracking-wider truncate flex-1 text-right ${homeWon ? "text-white" : "text-white/60"}`}>
                          {match.home_team?.name || "TBD"}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[13px] font-black font-mono w-5 text-center ${homeWon ? "${theme.primary}" : "text-white/40"}`}>
                            {homeScore !== null ? homeScore : "—"}
                          </span>
                          <span className="text-white/20 text-[10px]">:</span>
                          <span className={`text-[13px] font-black font-mono w-5 text-center ${awayWon ? "${theme.primary}" : "text-white/40"}`}>
                            {awayScore !== null ? awayScore : "—"}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider truncate flex-1 ${awayWon ? "text-white" : "text-white/60"}`}>
                          {match.away_team?.name || "TBD"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">{statusBadge(match.status)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Third place */}
        {getMatchesByStage("THIRD_PLACE").length > 0 && (
          <div
            className="rounded-2xl border border-amber-500/20 overflow-hidden"
            style={{ background: "rgba(5,8,17,0.85)" }}
          >
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-500/20 bg-amber-500/5">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-400">
                Tercer Puesto
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {getMatchesByStage("THIRD_PLACE").map((match) => {
                const isScheduled = match.status === "SCHEDULED" || match.status === "PRÓXIMO";
                const homeScore = isScheduled ? null : match.home_score;
                const awayScore = isScheduled ? null : match.away_score;
                const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
                const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;
                return (
                  <div key={match.id} className="flex items-center px-5 py-3.5 gap-4">
                    <div className="flex flex-col gap-0.5 w-24 shrink-0">
                      <span className="text-[10px] font-mono text-white/50">{match.match_date ?? "—"}</span>
                      <span className="text-[10px] font-mono text-white/30">
                        {match.match_time ? match.match_time.substring(0, 5) : ""}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <span className={`text-[11px] font-bold uppercase tracking-wider truncate flex-1 text-right ${homeWon ? "text-white" : "text-white/60"}`}>
                        {match.home_team?.name || "TBD"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[13px] font-black font-mono w-5 text-center ${homeWon ? "${theme.primary}" : "text-white/40"}`}>
                          {homeScore !== null ? homeScore : "—"}
                        </span>
                        <span className="text-white/20 text-[10px]">:</span>
                        <span className={`text-[13px] font-black font-mono w-5 text-center ${awayWon ? "${theme.primary}" : "text-white/40"}`}>
                          {awayScore !== null ? awayScore : "—"}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider truncate flex-1 ${awayWon ? "text-white" : "text-white/60"}`}>
                        {match.away_team?.name || "TBD"}
                      </span>
                    </div>
                    <div className="shrink-0">{statusBadge(match.status)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Tree view ──────────────────────────────────────────────────────
  const TreeView = ({ cupMatches }: { cupMatches: any[] }) => {
    const cupName = cupMatches[0]?.cup_name || "";
    const theme = getTheme(cupName);
    const getMatchesByStage = (stage: string) => cupMatches.filter((m) => m.stage === stage);
    const round16 = getMatchesByStage("ROUND_16");
    const quarterfinals = getMatchesByStage("QUARTERFINAL");
    const semifinals = getMatchesByStage("SEMIFINAL");
    const final = getMatchesByStage("FINAL");
    const thirdPlace = getMatchesByStage("THIRD_PLACE");

    const hasRound16 = round16.length > 0;
    const hasQuarterfinals = quarterfinals.length > 0 || hasRound16;
    const hasSemifinals = semifinals.length > 0 || hasQuarterfinals;
    const hasFinal = final.length > 0 || hasSemifinals;

    return (
      <div className="w-full overflow-x-auto py-8 custom-scrollbar mobile-zoom-bracket">
        {/* pt-10 leaves room for the absolute headers */}
        <div className="flex items-stretch min-w-[1000px] max-w-[1400px] mx-auto gap-4 md:gap-8 relative px-4 pt-10">

          {/* OCTAVOS DE FINAL */}
          {hasRound16 && (
          <>
            <div className="flex-1 flex flex-col justify-around relative z-10">
              <h4 className={`text-[9px] ${theme.primary} opacity-50 uppercase tracking-widest font-mono font-bold text-center absolute -top-8 w-full left-0`}>
                // OCTAVOS
              </h4>
              <MatchNode match={round16[0]} cupName={cupName} />
              <MatchNode match={round16[1]} cupName={cupName} />
              <MatchNode match={round16[2]} cupName={cupName} />
              <MatchNode match={round16[3]} cupName={cupName} />
              <MatchNode match={round16[4]} cupName={cupName} />
              <MatchNode match={round16[5]} cupName={cupName} />
              <MatchNode match={round16[6]} cupName={cupName} />
              <MatchNode match={round16[7]} cupName={cupName} />
            </div>
            {/* Connectors to Cuartos */}
            <div className="hidden md:flex flex-col w-8 opacity-30">
              <div style={{ flex: 1 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 2 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 2 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 2 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 1 }} />
            </div>
          </>
          )}

          {/* CUARTOS DE FINAL */}
          {hasQuarterfinals && (
          <>
            <div className="flex-1 flex flex-col justify-around relative z-10">
              <h4 className={`text-[9px] ${theme.primary} opacity-50 uppercase tracking-widest font-mono font-bold text-center absolute -top-8 w-full left-0`}>
                // CUARTOS
              </h4>
              <MatchNode match={quarterfinals[0]} cupName={cupName} />
              <MatchNode match={quarterfinals[1]} cupName={cupName} />
              <MatchNode match={quarterfinals[2]} cupName={cupName} />
              <MatchNode match={quarterfinals[3]} cupName={cupName} />
            </div>
            {/* Connectors to Semis */}
            <div className="hidden md:flex flex-col w-8 opacity-30">
              <div style={{ flex: 1 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 2 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 1 }} />
            </div>
          </>
        )}

        {/* SEMIFINALES */}
        {hasSemifinals && (
          <>
            <div className="flex-1 flex flex-col justify-around relative z-10">
              <h4 className={`text-[9px] ${theme.primary} opacity-50 uppercase tracking-widest font-mono font-bold text-center absolute -top-8 w-full left-0`}>
                // SEMIFINALES
              </h4>
              <MatchNode match={semifinals[0]} cupName={cupName} />
              <MatchNode match={semifinals[1]} cupName={cupName} />
            </div>
            {/* Connector to Final */}
            <div className="hidden md:flex flex-col w-8 opacity-30">
              <div style={{ flex: 1 }} />
              <div style={{ flex: 2 }} className={`border-r border-t border-b ${theme.borderSolid} rounded-r-lg w-full`} />
              <div style={{ flex: 1 }} />
            </div>
          </>
        )}

        {/* FINAL */}
        {hasFinal && (
          <div className="flex-1 flex flex-col justify-around relative z-10">
            <h4 className={`text-[9px] ${theme.finalHeader} uppercase tracking-widest font-mono font-bold text-center absolute -top-8 w-full left-0`}>
              // FINAL
            </h4>
            <MatchNode match={final[0]} isFinal cupName={cupName} />
          </div>
        )}

      </div>

      {/* Third place below tree */}
      {thirdPlace.length > 0 && (
        <div className="max-w-[350px] mx-auto mt-8">
          <h4 className="text-[9px] text-amber-400/70 uppercase tracking-widest font-mono font-bold text-center mb-3">
            Tercer Puesto
          </h4>
          <MatchNode match={thirdPlace[0]} cupName={cupName} />
        </div>
      )}
    </div>
  );
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation: Árbol / Rondas */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={() => setView("tree")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
            view === "tree"
              ? "bg-[#0055cc]/30 border-[#0055cc]/60 text-[#00f0ff]"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          <GitMerge size={12} />
          Árbol
        </button>
        <button
          onClick={() => setView("rounds")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
            view === "rounds"
              ? "bg-[#0055cc]/30 border-[#0055cc]/60 text-[#00f0ff]"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          <List size={12} />
          Rondas
        </button>
      </div>

      <div className="flex flex-col gap-16">
        {cups.map((cupName, idx) => {
          const cupMatches = knockoutMatches.filter(m => (m.cup_name || "Copa Principal") === cupName);
          
          return (
            <div key={idx} className="w-full relative">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent ${theme.to50}" />
                <h3 className="${theme.primary} font-black uppercase tracking-widest text-lg ${theme.glowText} flex items-center gap-2">
                  <Trophy size={20} />
                  {cupName}
                </h3>
                <div className="h-px w-16 bg-gradient-to-l from-transparent ${theme.to50}" />
              </div>

              {view === "tree" ? <TreeView cupMatches={cupMatches} /> : <RoundsView cupMatches={cupMatches} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
