"use client";

import { useState } from "react";
import { Medal, Goal, Search } from "lucide-react";
import Image from "next/image";
import { PlayerProfileModal } from "./PlayerProfileModal";

export const ScorersWidget = ({ scorers = [], tournamentId }: { scorers?: any[], tournamentId?: string }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredScorers = scorers.filter(scorer => 
    scorer.player_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPlayerProfile = (player: any) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };
  return (
    <div className={`panel-premium w-full p-6 flex flex-col ${scorers.length > 0 ? "h-full min-h-[410px]" : "h-auto"} relative overflow-hidden`}>
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-yellow to-transparent opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-yellow/10 blur-[30px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-navy/50 border border-brand-yellow/20 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
            <Medal className="text-brand-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" size={16} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
            Goleadores
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-brand-aqua/40 uppercase tracking-widest hidden md:block mr-2">
            toca un jugador para ver perfil
          </span>
          <button 
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchTerm("");
            }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              isSearching 
                ? "bg-brand-yellow/20 border-brand-yellow text-white" 
                : "bg-brand-navy/30 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/20 hover:border-brand-yellow"
            }`}
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      {isSearching && (
        <div className="relative z-10 mb-4 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-brand-yellow/40 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-brand-yellow transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 relative z-10">
        {filteredScorers.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-brand-aqua/50 font-bold border border-dashed border-brand-navy/50 rounded-xl">
            Aún no hay goleadores
          </div>
        ) : (
          filteredScorers.map((scorer, idx) => {
            const rank = scorers.findIndex(s => s.player_id === scorer.player_id) + 1;
            const isFirst = rank === 1;
            return (
              <div
                key={scorer.player_id}
                onClick={() => openPlayerProfile(scorer)}
                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                  isFirst
                    ? "bg-gradient-to-r from-brand-yellow/10 to-transparent border-l-[3px] border-brand-yellow shadow-[inset_15px_0_20px_-15px_rgba(255,215,0,0.2)] hover:bg-brand-yellow/20"
                    : "bg-[#02060d]/80 border border-brand-navy/50 hover:bg-brand-teal/[0.05] hover:border-brand-teal/30 hover:shadow-[inset_3px_0_0_0_#00f0ff]"
                }`}
              >
                {/* Pos */}
                <div className="w-5 text-center shrink-0">
                  <span
                    className={`text-xs font-black ${
                      isFirst ? "text-brand-yellow drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" : "text-brand-aqua/50 group-hover:text-brand-teal transition-colors"
                    }`}
                  >
                    {rank}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                    isFirst
                      ? "border-2 border-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.3)] bg-[#02060d]"
                      : "border border-brand-navy/80 group-hover:border-brand-teal/50 bg-[#02060d] shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors"
                  }`}
                >
                  {scorer.photo_url ? (
                    <Image src={scorer.photo_url} alt={scorer.player_name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className={`text-[10px] font-black ${isFirst ? "text-brand-yellow" : "text-brand-teal/50"}`}>{scorer.number || '-'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span
                    className={`text-xs font-bold truncate uppercase tracking-wide ${
                      isFirst ? "text-white" : "text-brand-sand group-hover:text-white transition-colors"
                    }`}
                  >
                    {scorer.player_name}
                  </span>
                  <span className="text-[9px] text-brand-aqua/60 font-medium truncate uppercase tracking-widest mt-0.5">
                    {scorer.team_name}
                  </span>
                </div>

                {/* Goals */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#02060d] rounded-lg border border-brand-navy/50 shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  <span className={`text-base font-black font-mono leading-none ${isFirst ? "text-brand-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" : "text-white group-hover:text-brand-teal transition-colors"}`}>
                    {scorer.goals}
                  </span>
                  <Goal size={12} className={isFirst ? "text-brand-yellow" : "text-brand-aqua/40 group-hover:text-brand-teal transition-colors"} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <PlayerProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
        tournamentId={tournamentId}
      />
    </div>
  );
};
