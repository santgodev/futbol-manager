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
    <div className={`w-full p-6 flex flex-col ${scorers.length > 0 ? "h-full min-h-[410px]" : "h-auto"} relative overflow-hidden rounded-xl bg-[#1A1D24] border border-[#2D3342] border-l-[4px] border-l-[#f59e0b] shadow-xl`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#222732] border border-[#2D3342]">
            <Medal className="text-[#f59e0b]" size={16} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
            Goleadores
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest hidden md:block mr-2">
            toca un jugador
          </span>
          <button 
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchTerm("");
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
              isSearching 
                ? "bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]" 
                : "bg-[#222732] border-[#2D3342] text-slate-400 hover:bg-[#2A303D] hover:text-slate-200"
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
            className="w-full bg-[#151921] border border-[#2D3342] rounded-lg px-4 py-2 text-xs text-slate-200 outline-none focus:border-[#f59e0b] transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 relative z-10">
        {filteredScorers.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-500 font-bold border border-dashed border-[#2D3342] rounded-xl">
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
                    ? "bg-[#b8860b]/10 border-l-[3px] border-[#b8860b]"
                    : "bg-[#151921] border border-[#2D3342] hover:bg-[#222732]"
                }`}
              >
                {/* Pos */}
                <div className="w-5 text-center shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isFirst ? "text-[#f59e0b]" : "text-slate-500 group-hover:text-[#0088ff] transition-colors"
                    }`}
                  >
                    {rank}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                    isFirst
                      ? "border-2 border-[#f59e0b] bg-[#1A1D24]"
                      : "border border-[#2D3342] bg-[#1A1D24] group-hover:border-[#0088ff]/50 transition-colors"
                  }`}
                >
                  {scorer.photo_url ? (
                    <Image src={scorer.photo_url} alt={scorer.player_name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className={`text-[10px] font-bold ${isFirst ? "text-[#f59e0b]" : "text-slate-500"}`}>{scorer.number || '-'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span
                    className={`text-xs font-semibold truncate uppercase tracking-wide ${
                      isFirst ? "text-slate-200" : "text-slate-300 group-hover:text-slate-200 transition-colors"
                    }`}
                  >
                    {scorer.player_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-widest mt-0.5">
                    {scorer.team_name}
                  </span>
                </div>

                {/* Goals */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1D24] rounded-lg border border-[#2D3342] shrink-0">
                  <span className={`text-sm font-bold leading-none ${isFirst ? "text-[#f59e0b]" : "text-slate-200 group-hover:text-[#0088ff] transition-colors"}`}>
                    {scorer.goals}
                  </span>
                  <Goal size={12} className={isFirst ? "text-[#f59e0b]" : "text-slate-600 group-hover:text-[#0088ff] transition-colors"} />
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
