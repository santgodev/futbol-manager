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
  const MatchNode = ({ match, isFinal = false }: { match?: any; isFinal?: boolean }) => {
    if (!match) {
      return (
        <div className="flex flex-col w-full glass-panel h-[90px] justify-center px-4 relative group opacity-60">
          <div className="flex justify-between items-center text-white/30 uppercase tracking-widest text-[10px] mb-2 font-bold font-mono">
            <span>TBD</span>
            <span>—</span>
          </div>
          <div className="flex justify-between items-center text-white/30 uppercase tracking-widest text-[10px] font-bold font-mono">
            <span>TBD</span>
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
        className={`flex flex-col w-full glass-panel relative group overflow-hidden transition-all ${
          isFinal
            ? "!border-brand-yellow shadow-[0_0_20px_rgba(255,215,0,0.15)]"
            : "hover:border-brand-cyan/50"
        }`}
      >
        {isFinal && (
          <div className="absolute top-0 left-0 w-full bg-brand-yellow text-brand-deep text-[8px] font-black uppercase tracking-widest text-center py-0.5 shadow-[0_1px_5px_rgba(0,0,0,0.3)] select-none">
            Gran Final
          </div>
        )}

        <div className={`flex justify-between items-center p-3 border-b border-white/5 ${isFinal ? "mt-4" : ""}`}>
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield
              className={`w-4 h-5 ${homeWon ? "text-brand-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]" : "text-brand-cyan/20"}`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider truncate ${
                homeWon ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" : "text-brand-text-muted"
              }`}
            >
              {match.home_team?.name || "TBD"}
            </span>
          </div>
          <span
            className={`text-sm font-black font-mono ${
              homeWon ? "text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" : "text-brand-text-muted"
            }`}
          >
            {homeScore !== null ? homeScore : "—"}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-brand-deep/30">
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield
              className={`w-4 h-5 ${awayWon ? "text-brand-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]" : "text-brand-cyan/20"}`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider truncate ${
                awayWon ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" : "text-brand-text-muted"
              }`}
            >
              {match.away_team?.name || "TBD"}
            </span>
          </div>
          <span
            className={`text-sm font-black font-mono ${
              awayWon ? "text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" : "text-brand-text-muted"
            }`}
          >
            {awayScore !== null ? awayScore : "—"}
          </span>
        </div>

        {match.home_penalty_score !== null && match.away_penalty_score !== null && (
          <div className="w-full text-[8px] text-center bg-brand-cyan/10 text-brand-cyan py-0.5 uppercase tracking-widest font-mono font-bold border-t border-white/5">
            PEN: {match.home_penalty_score} - {match.away_penalty_score}
          </div>
        )}
      </div>
    );
  };

  // ── Rounds view ────────────────────────────────────────────────────
  const RoundsView = ({ cupMatches }: { cupMatches: any[] }) => {
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
              className="rounded-2xl border border-[#00f0ff]/10 overflow-hidden"
              style={{ background: "rgba(5,8,17,0.85)" }}
            >
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#00f0ff]/10 bg-[#0a1526]/70">
                <span
                  className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                    stage === "FINAL" ? "text-[#f59e0b]" : "text-[#00f0ff]"
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
                          <span className={`text-[13px] font-black font-mono w-5 text-center ${homeWon ? "text-[#00f0ff]" : "text-white/40"}`}>
                            {homeScore !== null ? homeScore : "—"}
                          </span>
                          <span className="text-white/20 text-[10px]">:</span>
                          <span className={`text-[13px] font-black font-mono w-5 text-center ${awayWon ? "text-[#00f0ff]" : "text-white/40"}`}>
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
                        <span className={`text-[13px] font-black font-mono w-5 text-center ${homeWon ? "text-[#00f0ff]" : "text-white/40"}`}>
                          {homeScore !== null ? homeScore : "—"}
                        </span>
                        <span className="text-white/20 text-[10px]">:</span>
                        <span className={`text-[13px] font-black font-mono w-5 text-center ${awayWon ? "text-[#00f0ff]" : "text-white/40"}`}>
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
    const getMatchesByStage = (stage: string) => cupMatches.filter((m) => m.stage === stage);
    const quarterfinals = getMatchesByStage("QUARTERFINAL");
    const semifinals = getMatchesByStage("SEMIFINAL");
    const final = getMatchesByStage("FINAL");
    const thirdPlace = getMatchesByStage("THIRD_PLACE");

    return (
      <div className="w-full overflow-x-auto py-4 custom-scrollbar">
        <div className="flex items-stretch min-w-[800px] max-w-[1000px] mx-auto gap-8 relative px-4">

          {/* CUARTOS DE FINAL */}
          {quarterfinals.length > 0 && (
          <>
            <div className="flex-1 flex flex-col justify-around gap-4 md:gap-8 relative z-10">
              <h4 className="text-[9px] text-brand-cyan/50 uppercase tracking-widest font-mono font-bold text-center mb-2">
                // CUARTOS
              </h4>
              <MatchNode match={quarterfinals[0]} />
              <MatchNode match={quarterfinals[1]} />
              <MatchNode match={quarterfinals[2]} />
              <MatchNode match={quarterfinals[3]} />
            </div>
            <div className="hidden md:flex flex-col justify-around w-8 py-12">
              <div className="h-1/4 border-r border-t border-b border-brand-cyan/10 rounded-r-lg w-full mb-12" />
              <div className="h-1/4 border-r border-t border-b border-brand-cyan/10 rounded-r-lg w-full mt-12" />
            </div>
          </>
        )}

        {/* SEMIFINALES */}
        {semifinals.length > 0 && (
          <>
            <div className="flex-1 flex flex-col justify-around gap-16 md:gap-32 py-12 relative z-10">
              <h4 className="text-[9px] text-brand-cyan/50 uppercase tracking-widest font-mono font-bold text-center mb-2 absolute top-0 w-full left-0">
                // SEMIFINALES
              </h4>
              <MatchNode match={semifinals[0]} />
              <MatchNode match={semifinals[1]} />
            </div>
            <div className="hidden md:flex flex-col justify-center w-8 py-32">
              <div className="h-1/2 border-r border-t border-b border-brand-cyan/30 rounded-r-lg w-full" />
            </div>
          </>
        )}

        {/* FINAL */}
        {final.length > 0 && (
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <h4 className="text-[9px] text-brand-yellow uppercase tracking-widest font-mono font-bold text-center mb-2 absolute top-0 w-full left-0">
              // FINAL
            </h4>
            <MatchNode match={final[0]} isFinal />
          </div>
        )}

      </div>

      {/* Third place below tree */}
      {thirdPlace.length > 0 && (
        <div className="max-w-[350px] mx-auto mt-8">
          <h4 className="text-[9px] text-amber-400/70 uppercase tracking-widest font-mono font-bold text-center mb-3">
            Tercer Puesto
          </h4>
          <MatchNode match={thirdPlace[0]} />
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
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00f0ff]/50" />
                <h3 className="text-[#00f0ff] font-black uppercase tracking-widest text-lg drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2">
                  <Trophy size={20} />
                  {cupName}
                </h3>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00f0ff]/50" />
              </div>

              {view === "tree" ? <TreeView cupMatches={cupMatches} /> : <RoundsView cupMatches={cupMatches} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
