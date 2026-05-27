"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, Shield } from "lucide-react";

interface Match {
  id: string;
  home_team?: { name: string; logo_url: string | null } | null;
  away_team?: { name: string; logo_url: string | null } | null;
  home_score: number | null;
  away_score: number | null;
  home_penalty_score: number | null;
  away_penalty_score: number | null;
  status: string;
  is_knockout: boolean;
  stage: string;
  bracket_order: number | null;
  winner_team_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
}

const STAGE_ORDER = ["ROUND_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"];
const STAGE_LABELS: Record<string, string> = {
  ROUND_16: "Octavos de Final",
  QUARTERFINAL: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  FINAL: "Final",
};

export function TournamentBracket({ matches }: { matches: Match[] }) {
  const knockoutMatches = matches.filter((m) => m.is_knockout);

  if (knockoutMatches.length === 0) {
    return (
      <div className="py-12 text-center text-[#00f0ff]/40 text-xs font-bold uppercase tracking-widest">
        Aún no hay partidos de fase eliminatoria programados.
      </div>
    );
  }

  // Agrupar y ordenar
  const bracketData: Record<string, Match[]> = {};
  
  STAGE_ORDER.forEach((stage) => {
    const stageMatches = knockoutMatches.filter((m) => m.stage === stage);
    if (stageMatches.length > 0) {
      // Ordenar por bracket_order
      bracketData[stage] = stageMatches.sort((a, b) => (a.bracket_order || 0) - (b.bracket_order || 0));
    }
  });

  return (
    <div className="w-full overflow-x-auto snap-x snap-mandatory pb-8 pt-4 custom-scrollbar">
      <div className="flex gap-12 min-w-max px-4">
        {STAGE_ORDER.map((stage) => {
          const matchesInStage = bracketData[stage];
          if (!matchesInStage) return null;

          return (
            <div key={stage} className="w-[320px] shrink-0 snap-center flex flex-col gap-6">
              {/* Header de la Fase */}
              <div className="text-center pb-4 border-b border-[#0055cc]/30 mb-2 relative">
                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
                <h3 className="text-[#00f0ff] font-black uppercase tracking-widest text-sm drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                  {STAGE_LABELS[stage] || stage}
                </h3>
              </div>

              {/* Partidos de la Fase */}
              <div className="flex flex-col gap-8 flex-1 justify-center">
                {matchesInStage.map((match) => (
                  <BracketMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BracketMatchCard({ match }: { match: Match }) {
  const renderTeam = (
    team: { name: string; logo_url: string | null } | null | undefined,
    teamId: string | null,
    score: number | null,
    penaltyScore: number | null,
    isWinner: boolean,
    isLoser: boolean
  ) => {
    const hasPlayed = match.status === "FINISHED";

    return (
      <div 
        className={`flex items-center justify-between p-3 transition-all ${
          isWinner ? "bg-[#00f0ff]/10" : ""
        } ${isLoser ? "opacity-50 grayscale" : ""}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-[#001122] rounded-md border border-[#0055cc]/30 p-1 flex-shrink-0 flex items-center justify-center">
            {team?.logo_url ? (
              <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
            ) : (
              <Shield size={14} className="text-white/20" />
            )}
          </div>
          <span className={`text-xs font-bold uppercase truncate ${isWinner ? "text-[#00f0ff]" : "text-white/80"}`}>
            {team?.name || "TBD"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Penales */}
          {hasPlayed && penaltyScore !== null && (
            <span className="text-[10px] font-mono text-[#00f0ff]/70 tracking-tighter">
              ({penaltyScore})
            </span>
          )}
          {/* Marcador normal */}
          <span className={`font-black font-mono w-6 text-right ${isWinner ? "text-[#00f0ff]" : "text-white"}`}>
            {score !== null ? score : "-"}
          </span>
        </div>
      </div>
    );
  };

  const isHomeWinner = match.winner_team_id === match.home_team_id;
  const isAwayWinner = match.winner_team_id === match.away_team_id;
  const isFinished = match.status === "FINISHED";

  return (
    <div className="relative group">
      {/* Glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-teal to-brand-cyan rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
      
      <div className="bg-[#050b14]/90 backdrop-blur-xl border border-brand-teal/30 rounded-xl overflow-hidden relative z-10 flex flex-col shadow-[inset_0_0_15px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.6)] group-hover:border-brand-teal/50 transition-all">
        
        {/* Info top bar */}
        <div className="bg-[#001122] px-3 py-1.5 flex justify-between items-center border-b border-[#0055cc]/20">
          <span className="text-[9px] font-mono text-white/40">ORDEN: {match.bracket_order || 0}</span>
          {match.status === "EN CURSO" && (
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
            </span>
          )}
          {match.status === "FINISHED" && (
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Final</span>
          )}
        </div>

        {/* Teams */}
        <div className="flex flex-col divide-y divide-[#0055cc]/10">
          {renderTeam(
            match.home_team, 
            match.home_team_id, 
            match.home_score, 
            match.home_penalty_score, 
            isFinished && isHomeWinner, 
            isFinished && !isHomeWinner
          )}
          {renderTeam(
            match.away_team, 
            match.away_team_id, 
            match.away_score, 
            match.away_penalty_score, 
            isFinished && isAwayWinner, 
            isFinished && !isAwayWinner
          )}
        </div>
        
        {/* Enlace al partido si el admin quiere ir a LiveControlRoom */}
        <Link 
          href={`/admin/match-room?id=${match.id}`}
          className="absolute inset-0 z-20"
          title="Ver Partido"
        />

      </div>
    </div>
  );
}
