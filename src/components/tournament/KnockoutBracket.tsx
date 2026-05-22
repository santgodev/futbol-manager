"use client";

import { Shield } from "@/components/ui/Shield";

interface KnockoutBracketProps {
  matches: any[];
}

export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  // Filtrar y agrupar por fase
  const getMatchesByStage = (stage: string) => {
    return matches.filter(m => m.stage === stage);
  };

  const quarterfinals = getMatchesByStage('QUARTERFINAL');
  const semifinals = getMatchesByStage('SEMIFINAL');
  const final = getMatchesByStage('FINAL');

  // Si no hay partidos de eliminatoria en absoluto, mostrar un mensaje premium
  if (quarterfinals.length === 0 && semifinals.length === 0 && final.length === 0) {
    return (
      <section id="bracket" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        {/* Section Header */}
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

        <div className="w-full glass-panel p-12 flex flex-col items-center justify-center border-dashed">
          <Shield className="w-12 h-16 text-brand-cyan/20 mb-4" />
          <h3 className="text-white font-bold uppercase tracking-widest text-sm">Fase Final No Definida</h3>
          <p className="text-brand-text-muted text-[10px] font-mono uppercase tracking-widest mt-2 text-center max-w-sm">
            Los cruces eliminatorios se revelarán una vez que concluya la fase de grupos.
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
            <span>-</span>
          </div>
          <div className="flex justify-between items-center text-white/30 uppercase tracking-widest text-[10px] font-bold font-mono">
            <span>TBD</span>
            <span>-</span>
          </div>
        </div>
      );
    }

    const homeScore = match.home_score ?? '-';
    const awayScore = match.away_score ?? '-';
    
    // Validar ganador para resaltar
    const homeWon = match.home_score !== null && match.away_score !== null && match.home_score > match.away_score;
    const awayWon = match.home_score !== null && match.away_score !== null && match.away_score > match.home_score;

    return (
      <div className={`flex flex-col w-full glass-panel relative group overflow-hidden transition-all ${isFinal ? '!border-brand-yellow shadow-[0_0_20px_rgba(255,215,0,0.15)]' : 'hover:border-brand-cyan/50'}`}>
        
        {/* Etiqueta de la final */}
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
            {homeScore}
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
            {awayScore}
          </span>
        </div>

        {/* Indicador de penales si aplica */}
        {(match.home_penalty_score !== null || match.away_penalty_score !== null) && (
          <div className="w-full text-[8px] text-center bg-brand-cyan/10 text-brand-cyan py-0.5 uppercase tracking-widest font-mono font-bold border-t border-white/5">
            PEN: {match.home_penalty_score} - {match.away_penalty_score}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="bracket" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-12 pb-4 border-b border-white/5">
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

      <div className="w-full overflow-x-auto py-4 custom-scrollbar">
        <div className="flex items-stretch min-w-[800px] max-w-[1000px] mx-auto gap-8 relative px-4">
          
          {/* CUARTOS DE FINAL */}
          <div className="flex-1 flex flex-col justify-around gap-4 md:gap-8 relative z-10">
            <h4 className="text-[9px] text-brand-cyan/50 uppercase tracking-widest font-mono font-bold text-center mb-2">// CUARTOS</h4>
            <MatchNode match={quarterfinals[0]} />
            <MatchNode match={quarterfinals[1]} />
            <MatchNode match={quarterfinals[2]} />
            <MatchNode match={quarterfinals[3]} />
          </div>

          {/* LÍNEAS CONECTORAS QF -> SF */}
          <div className="hidden md:flex flex-col justify-around w-8 py-12">
            <div className="h-1/4 border-r border-t border-b border-brand-cyan/10 rounded-r-lg w-full mb-12"></div>
            <div className="h-1/4 border-r border-t border-b border-brand-cyan/10 rounded-r-lg w-full mt-12"></div>
          </div>

          {/* SEMIFINALES */}
          <div className="flex-1 flex flex-col justify-around gap-16 md:gap-32 py-12 relative z-10">
            <h4 className="text-[9px] text-brand-cyan/50 uppercase tracking-widest font-mono font-bold text-center mb-2 absolute top-0 w-full left-0">// SEMIFINALES</h4>
            <MatchNode match={semifinals[0]} />
            <MatchNode match={semifinals[1]} />
          </div>

          {/* LÍNEAS CONECTORAS SF -> F */}
          <div className="hidden md:flex flex-col justify-center w-8 py-32">
            <div className="h-1/2 border-r border-t border-b border-brand-cyan/30 rounded-r-lg w-full"></div>
          </div>

          {/* FINAL */}
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <h4 className="text-[9px] text-brand-yellow uppercase tracking-widest font-mono font-bold text-center mb-2 absolute top-0 w-full left-0">// FINAL</h4>
            <MatchNode match={final[0]} isFinal />
          </div>

        </div>
      </div>
    </section>
  );
}
