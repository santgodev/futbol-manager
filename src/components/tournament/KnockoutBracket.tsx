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
      <div className="p-12 border border-dashed border-brand-navy/30 bg-brand-deep flex flex-col items-center justify-center">
        <Shield className="w-12 h-16 text-brand-navy mb-4" />
        <h3 className="text-brand-sand font-bold uppercase tracking-widest text-lg">Fase Final No Definida</h3>
        <p className="text-brand-aqua/50 text-xs uppercase tracking-widest mt-2 text-center max-w-sm">
          Los cruces eliminatorios se revelarán una vez que concluya la fase de grupos.
        </p>
      </div>
    );
  }

  const MatchNode = ({ match, isFinal = false }: { match?: any, isFinal?: boolean }) => {
    if (!match) {
      return (
        <div className="flex flex-col w-full bg-brand-navy/10 border border-brand-navy/30 h-[90px] justify-center px-4 relative group">
          <div className="flex justify-between items-center text-brand-aqua/30 uppercase tracking-widest text-[10px] mb-2 font-bold">
            <span>TBD</span>
            <span>-</span>
          </div>
          <div className="flex justify-between items-center text-brand-aqua/30 uppercase tracking-widest text-[10px] font-bold">
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
      <div className={`flex flex-col w-full bg-black border relative group overflow-hidden transition-all ${isFinal ? 'border-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'border-brand-navy/50 hover:border-brand-teal/50'}`}>
        
        {/* Etiqueta de la final */}
        {isFinal && (
          <div className="absolute top-0 left-0 w-full bg-brand-teal text-brand-deep text-[8px] font-black uppercase tracking-widest text-center py-0.5">
            Gran Final
          </div>
        )}

        <div className={`flex justify-between items-center p-3 border-b border-brand-navy/30 ${isFinal ? 'mt-4' : ''}`}>
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield className={`w-4 h-5 ${homeWon ? 'text-brand-teal' : 'text-brand-aqua/50'}`} />
            <span className={`text-xs md:text-sm font-bold uppercase tracking-widest truncate ${homeWon ? 'text-white' : 'text-brand-sand'}`}>
              {match.home_team?.name || 'TBD'}
            </span>
          </div>
          <span className={`text-sm md:text-lg font-black ${homeWon ? 'text-brand-teal' : 'text-brand-sand'}`}>
            {homeScore}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-brand-deep/30">
          <div className="flex items-center gap-3 truncate pr-2">
            <Shield className={`w-4 h-5 ${awayWon ? 'text-brand-teal' : 'text-brand-aqua/50'}`} />
            <span className={`text-xs md:text-sm font-bold uppercase tracking-widest truncate ${awayWon ? 'text-white' : 'text-brand-sand'}`}>
              {match.away_team?.name || 'TBD'}
            </span>
          </div>
          <span className={`text-sm md:text-lg font-black ${awayWon ? 'text-brand-teal' : 'text-brand-sand'}`}>
            {awayScore}
          </span>

        </div>

        {/* Indicador de penales si aplica */}
        {(match.home_penalty_score !== null || match.away_penalty_score !== null) && (
          <div className="absolute bottom-0 left-0 w-full text-[9px] text-center bg-brand-navy/30 text-brand-aqua/70 py-0.5 uppercase tracking-widest">
            Pen: {match.home_penalty_score} - {match.away_penalty_score}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto py-8 hide-scrollbar">
      <div className="flex items-stretch min-w-[800px] max-w-[1200px] mx-auto gap-8 relative px-4">
        
        {/* CUARTOS DE FINAL */}
        <div className="flex-1 flex flex-col justify-around gap-4 md:gap-8">
          <h4 className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold text-center mb-4">Cuartos</h4>
          <MatchNode match={quarterfinals[0]} />
          <MatchNode match={quarterfinals[1]} />
          <MatchNode match={quarterfinals[2]} />
          <MatchNode match={quarterfinals[3]} />
        </div>

        {/* LÍNEAS CONECTORAS QF -> SF */}
        <div className="hidden md:flex flex-col justify-around w-8 py-12">
          {/* Aquí irían SVGs conectores, los simplificamos con bordes CSS */}
          <div className="h-1/4 border-r-2 border-t-2 border-b-2 border-brand-navy/30 rounded-r-lg w-full mb-12"></div>
          <div className="h-1/4 border-r-2 border-t-2 border-b-2 border-brand-navy/30 rounded-r-lg w-full mt-12"></div>
        </div>

        {/* SEMIFINALES */}
        <div className="flex-1 flex flex-col justify-around gap-16 md:gap-32 py-12">
          <h4 className="text-[10px] text-brand-aqua/50 uppercase tracking-widest font-bold text-center mb-4 absolute top-0 w-full left-0">Semifinales</h4>
          <MatchNode match={semifinals[0]} />
          <MatchNode match={semifinals[1]} />
        </div>

        {/* LÍNEAS CONECTORAS SF -> F */}
        <div className="hidden md:flex flex-col justify-center w-8 py-32">
          <div className="h-1/2 border-r-2 border-t-2 border-b-2 border-brand-teal/50 rounded-r-lg w-full"></div>
        </div>

        {/* FINAL */}
        <div className="flex-1 flex flex-col justify-center">
          <h4 className="text-[10px] text-brand-teal uppercase tracking-widest font-bold text-center mb-4 absolute top-0 w-full left-0">Final</h4>
          <MatchNode match={final[0]} isFinal />
        </div>

      </div>
    </div>
  );
}
