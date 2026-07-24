"use client";

import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { BracketGenerator } from "@/components/admin/BracketGenerator";
import { TournamentBracket } from "@/components/admin/TournamentBracket";

interface CollapsibleEliminatoriaSectionProps {
  isGroupStageComplete: boolean;
  matches: any[];
  id: string;
  teamsCount: number;
  groupMatchesPending: number;
  groupMatchesPlayed: number;
}

export function CollapsibleEliminatoriaSection({
  isGroupStageComplete,
  matches,
  id,
  teamsCount,
  groupMatchesPending,
  groupMatchesPlayed,
}: CollapsibleEliminatoriaSectionProps) {
  // If group stage is complete or there are already knockout matches, keep it open by default
  const hasKnockoutMatches = matches && matches.some((m: any) => m.is_knockout);
  const [isOpen, setIsOpen] = useState(isGroupStageComplete || hasKnockoutMatches);

  return (
    <section className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/15" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent" />
      
      <div 
        className="flex items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10 cursor-pointer hover:bg-[#001122]/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
          <Trophy size={14} className="text-[#00f0ff]" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Fase Eliminatoria</h2>
        
        {!isGroupStageComplete && !hasKnockoutMatches && (
          <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
            Bloqueada
          </span>
        )}
        
        <div className="ml-auto text-white/50">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-0 animate-in fade-in slide-in-from-top-2 duration-300">
          {(!matches || !hasKnockoutMatches) && (
            <div className="p-6 border-b border-[#0055cc]/20">
              <BracketGenerator 
                tournamentId={id} 
                isGroupStageComplete={isGroupStageComplete}
                pendingGroupMatchesCount={groupMatchesPending}
                registeredTeamsCount={teamsCount}
                matchesPlayed={groupMatchesPlayed}
              />
            </div>
          )}
          <TournamentBracket matches={matches || []} />
        </div>
      )}
    </section>
  );
}
