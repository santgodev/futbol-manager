"use client";

import { useState } from "react";
import { Shield } from "@/components/ui/Shield";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";


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

export function KnockoutBracket({ matches, totalTeams = 0 }: KnockoutBracketProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const getMatchesByStage = (stage: string) => {
    return matches.filter(m => m.stage === stage);
  };

  const quarterfinals = getMatchesByStage('QUARTERFINAL');
  const semifinals = getMatchesByStage('SEMIFINAL');
  const final = getMatchesByStage('FINAL');

  // Guardia de integridad: ¿hay partidos knockout en absoluto?
  const hasKnockoutMatches = quarterfinals.length > 0 || semifinals.length > 0 || final.length > 0;

  // Guardia de integridad: validar coherencia equipos vs stage
  const highestStagePresent = quarterfinals.length > 0 ? 'QUARTERFINAL'
    : semifinals.length > 0 ? 'SEMIFINAL'
    : final.length > 0 ? 'FINAL' : null;

  const isStructurallyValid = !highestStagePresent || (
    totalTeams === 0 || totalTeams >= (MIN_TEAMS_FOR_STAGE[highestStagePresent] || 0)
  );

  // Si no hay partidos de eliminatoria en absoluto
  if (!hasKnockoutMatches) {
    return (
      <section id="bracket" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Fase de Eliminatorias
            </h2>
          </div>
          <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest">
            Fase Final & Play-Offs
          </span>
        </div>

        <div className="w-full relative rounded-3xl p-12 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1526]/80 to-[#050810]/95 backdrop-blur-xl border border-[#00f0ff]/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden group">
          {/* Neon Top Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_15px_#00f0ff] opacity-80 group-hover:w-1/2 transition-all duration-700" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[120px] bg-[#00f0ff]/10 blur-[50px] pointer-events-none" />

          {/* Glowing Shield */}
          <div className="w-20 h-24 mb-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#00f0ff]/20 blur-[20px] rounded-full animate-pulse" />
            <Shield className="w-16 h-20 text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] relative z-10" />
          </div>

          <h3 className="text-white font-black uppercase tracking-widest text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Fase Final No Definida</h3>
          <p className="text-[#00f0ff]/60 text-[11px] font-mono uppercase tracking-[0.2em] mt-3 text-center max-w-md font-bold">
            Los cruces eliminatorios se revelarán una vez que concluya la fase de grupos.
          </p>
        </div>
      </section>
    );
  }

  // Guardia de integridad estructural: hay knockout pero no hay suficientes equipos
  if (!isStructurallyValid) {
    return (
      <section id="bracket" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Fase de Eliminatorias
            </h2>
          </div>
        </div>
        <div className="w-full glass-panel p-12 flex flex-col items-center justify-center border-amber-500/20">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <span className="text-xl">⚙️</span>
          </div>
          <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm">Eliminatorias en Configuración</h3>
          <p className="text-brand-text-muted text-[10px] font-mono uppercase tracking-widest mt-2 text-center max-w-sm">
            El formato eliminatorio está siendo configurado. Los cruces se publicarán pronto.
          </p>
        </div>
      </section>
    );
  }

  const MatchNode = ({ match, isFinal = false }: { match?: any, isFinal?: boolean }) => {
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

    const isMatchScheduled = match.status === "SCHEDULED";
    const homeScore = isMatchScheduled ? null : (match.home_score ?? null);
    const awayScore = isMatchScheduled ? null : (match.away_score ?? null);
    
    const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
    const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;

    return (
      <div className={`flex flex-col w-full glass-panel relative group overflow-hidden transition-all ${isFinal ? '!border-brand-yellow shadow-[0_0_20px_rgba(255,215,0,0.15)]' : 'hover:border-brand-cyan/50'}`}>
        
        {isFinal && (
          <div className="absolute top-0 left-0 w-full bg-brand-yellow text-brand-deep text-[8px] font-black uppercase tracking-widest text-center py-0.5 shadow-[0_1px_5px_rgba(0,0,0,0.3)] select-none">
            Gran Final
          </div>
        )}

        <div className={`flex justify-between items-center p-3 border-b border-white/5 ${isFinal ? 'mt-4' : ''}`}>
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield className={`w-4 h-5 ${homeWon ? 'text-brand-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]' : 'text-brand-cyan/20'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider truncate ${homeWon ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]' : 'text-brand-text-muted'}`}>
              {match.home_team?.name || 'TBD'}
            </span>
          </div>
          <span className={`text-sm font-black font-mono ${homeWon ? 'text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]' : 'text-brand-text-muted'}`}>
            {homeScore !== null ? homeScore : "—"}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-brand-deep/30">
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield className={`w-4 h-5 ${awayWon ? 'text-brand-cyan drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]' : 'text-brand-cyan/20'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider truncate ${awayWon ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]' : 'text-brand-text-muted'}`}>
              {match.away_team?.name || 'TBD'}
            </span>
          </div>
          <span className={`text-sm font-black font-mono ${awayWon ? 'text-brand-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]' : 'text-brand-text-muted'}`}>
            {awayScore !== null ? awayScore : "—"}
          </span>
        </div>

        {(match.home_penalty_score !== null || match.away_penalty_score !== null) && (
          <div className="w-full text-[8px] text-center bg-brand-cyan/10 text-brand-cyan py-0.5 uppercase tracking-widest font-mono font-bold border-t border-white/5">
            PEN: {match.home_penalty_score} - {match.away_penalty_score}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="bracket" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
      {/* Section header — always visible */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Fase de Eliminatorias
          </h2>
        </div>
        <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest hidden md:block">
          Fase Final & Play-Offs
        </span>
      </div>

      {/* Mobile: toggle button */}
      <button
        onClick={() => setMobileOpen(prev => !prev)}
        className="md:hidden w-full mt-4 mb-2 flex items-center justify-between px-4 py-3.5 rounded-2xl bg-brand-navy/50 border border-brand-teal/20 tap-feedback"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-sand">
          <Trophy size={14} className="text-brand-teal" />
          {mobileOpen ? "Ocultar Playoffs" : "🏆 Ver Playoffs"}
        </span>
        {mobileOpen
          ? <ChevronUp size={16} className="text-brand-teal" />
          : <ChevronDown size={16} className="text-brand-aqua/50" />
        }
      </button>

      {/* Bracket content — always shown on desktop, toggled on mobile */}
      <div className={`${mobileOpen ? "block" : "hidden"} md:block`}>
        <div className="w-full overflow-x-auto py-4 mt-4 md:mt-8 custom-scrollbar">
          <div className="flex items-stretch min-w-[800px] max-w-[1000px] mx-auto gap-8 relative px-4">

            {/* CUARTOS DE FINAL */}
            {quarterfinals.length > 0 && (
              <>
                <div className="flex-1 flex flex-col justify-around gap-4 md:gap-8 relative z-10">
                  <h4 className="text-[9px] text-brand-cyan/50 uppercase tracking-widest font-mono font-bold text-center mb-2">// CUARTOS</h4>
                  <MatchNode match={quarterfinals[0]} />
                  <MatchNode match={quarterfinals[1]} />
                  <MatchNode match={quarterfinals[2]} />
                  <MatchNode match={quarterfinals[3]} />
                </div>
                <div className="hidden md:flex flex-col justify-around w-8 py-12">
                  <div className="h-1/4 border-r border-t border-b border-brand-cyan/10 rounded-r-lg w-full mb-12"></div>
                  <div className="h-1/4 border-r border-t border-b border-brand-cyan/10 rounded-r-lg w-full mt-12"></div>
                </div>
              </>
            )}

            {/* SEMIFINALES */}
            {semifinals.length > 0 && (
              <>
                <div className="flex-1 flex flex-col justify-around gap-16 md:gap-32 py-12 relative z-10">
                  <h4 className="text-[9px] text-brand-cyan/50 uppercase tracking-widest font-mono font-bold text-center mb-2 absolute top-0 w-full left-0">// SEMIFINALES</h4>
                  <MatchNode match={semifinals[0]} />
                  <MatchNode match={semifinals[1]} />
                </div>
                <div className="hidden md:flex flex-col justify-center w-8 py-32">
                  <div className="h-1/2 border-r border-t border-b border-brand-cyan/30 rounded-r-lg w-full"></div>
                </div>
              </>
            )}

            {/* FINAL */}
            {final.length > 0 && (
              <div className="flex-1 flex flex-col justify-center relative z-10">
                <h4 className="text-[9px] text-brand-yellow uppercase tracking-widest font-mono font-bold text-center mb-2 absolute top-0 w-full left-0">// FINAL</h4>
                <MatchNode match={final[0]} isFinal />
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

