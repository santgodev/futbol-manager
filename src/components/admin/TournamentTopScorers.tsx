"use client";
import Image from "next/image";
import { Medal, Goal } from "lucide-react";

export function TournamentTopScorers({ scorers }: { scorers: any[] }) {
  if (!scorers || scorers.length === 0) {
    return (
      <div className="py-12 text-center text-white/40 text-xs uppercase tracking-widest font-bold">
        Aún no hay goles registrados en este torneo
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {scorers.slice(0, 5).map((scorer, index) => {
        const isTop = index === 0;
        return (
          <div 
            key={scorer.player_id}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              isTop 
                ? 'bg-gradient-to-r from-[#0055cc]/20 to-transparent border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]' 
                : 'bg-[#001122]/40 border-[#0055cc]/10 hover:border-[#0055cc]/30 hover:bg-[#001122]/80'
            }`}
          >
            <div className="w-8 flex justify-center shrink-0">
              {isTop ? (
                <Medal size={24} className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
              ) : (
                <span className="text-sm font-bold text-white/30 font-mono">{index + 1}</span>
              )}
            </div>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center border overflow-hidden shrink-0 ${
              isTop ? 'border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)] bg-black/60' : 'border-white/10 bg-black/40'
            }`}>
              {scorer.photo_url ? (
                <Image src={scorer.photo_url} alt={scorer.player_name} width={48} height={48} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-xs text-white/30">{scorer.number || '-'}</span>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className={`font-black uppercase tracking-widest text-sm truncate ${isTop ? 'text-white' : 'text-white/80'}`}>
                {scorer.player_name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                  {scorer.team_name}
                </span>
                <span className="text-[9px] text-[#00f0ff]/50 font-mono">#{scorer.number || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
              <span className={`text-xl font-black font-mono ${isTop ? 'text-[#00f0ff]' : 'text-white'}`}>
                {scorer.goals}
              </span>
              <Goal size={16} className={isTop ? 'text-[#00f0ff]/60' : 'text-white/20'} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
