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
    <div className={`w-full p-6 flex flex-col ${scorers.length > 0 ? "h-full min-h-[410px]" : "h-auto"} relative overflow-hidden rounded-[2rem] bg-[#24273A]/80 backdrop-blur-xl border border-[#3A3D55]/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)]`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-[#34384C] border border-[#44485F]">
            <Medal className="text-[#a5b4fc]" size={16} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
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
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
              isSearching 
                ? "bg-[#a5b4fc]/20 border-[#a5b4fc] text-[#a5b4fc]" 
                : "bg-[#34384C] border-[#44485F] text-slate-300 hover:bg-[#3E4259] hover:text-white"
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
            className="w-full bg-[#1F2233] border border-[#44485F] rounded-full px-5 py-2.5 text-xs text-white outline-none focus:border-[#a5b4fc] transition-colors shadow-inner"
            autoFocus
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1 relative z-10">
        {filteredScorers.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-500 font-bold border border-dashed border-[#44485F] rounded-2xl">
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
                className={`group relative flex items-center gap-3 p-2.5 rounded-full transition-all cursor-pointer shadow-sm ${
                  isFirst
                    ? "bg-[#3A4064] border border-[#a5b4fc]/30"
                    : "bg-[#2A2E43] border border-[#3A3D55]/50 hover:bg-[#34384C]"
                }`}
              >
                {/* Pos */}
                <div className="w-6 pl-2 text-center shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isFirst ? "text-[#a5b4fc]" : "text-slate-400 group-hover:text-white transition-colors"
                    }`}
                  >
                    {rank}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                    isFirst
                      ? "border border-[#a5b4fc]/50 bg-[#151921]"
                      : "border border-[#3A3D55] bg-[#151921] group-hover:border-[#a5b4fc]/30 transition-colors"
                  }`}
                >
                  {scorer.photo_url ? (
                    <Image src={scorer.photo_url} alt={scorer.player_name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className={`text-[10px] font-bold ${isFirst ? "text-[#a5b4fc]" : "text-slate-500"}`}>{scorer.number || '-'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span
                    className={`text-xs font-semibold truncate block ${
                      isFirst ? "text-white" : "text-slate-300 group-hover:text-white transition-colors"
                    }`}
                  >
                    {scorer.player_name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest mt-0.5">
                    {scorer.team_name}
                  </span>
                </div>

                {/* Goals */}
                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border shrink-0 ${isFirst ? "bg-[#a5b4fc]/20 border-[#a5b4fc]/30" : "bg-[#1F2233] border-[#3A3D55]"}`}>
                  <span className={`text-sm font-bold leading-none ${isFirst ? "text-[#a5b4fc]" : "text-slate-300 group-hover:text-white transition-colors"}`}>
                    {scorer.goals}
                  </span>
                  <Goal size={12} className={isFirst ? "text-[#a5b4fc]" : "text-slate-500 group-hover:text-white transition-colors"} />
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
