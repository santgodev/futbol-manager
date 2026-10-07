"use client";

import { motion } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import Image from "next/image";

export function TournamentChampions({ matches }: { matches: any[] }) {
  // Encontrar todas las finales que ya terminaron
  const finals = matches.filter(m => m.stage === "FINAL" && m.status === "FINISHED");
  
  if (finals.length === 0) return null;

  // Ordenar para que "Copa Oro" o similares queden primero
  const sortedFinals = [...finals].sort((a, b) => {
    const aName = (a.cup_name || "").toLowerCase();
    const bName = (b.cup_name || "").toLowerCase();
    if (aName.includes("oro")) return -1;
    if (bName.includes("oro")) return 1;
    if (aName.includes("plata")) return -1;
    if (bName.includes("plata")) return 1;
    return 0;
  });

  const getWinner = (match: any) => {
    const homeScore = match.home_score ?? 0;
    const awayScore = match.away_score ?? 0;
    
    if (homeScore > awayScore) return match.home_team;
    if (awayScore > homeScore) return match.away_team;
    
    // Empate, revisar penales
    const homePen = match.home_penalty_score ?? 0;
    const awayPen = match.away_penalty_score ?? 0;
    
    if (homePen > awayPen) return match.home_team;
    if (awayPen > homePen) return match.away_team;
    
    return null; // Caso extremo
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black tracking-[0.2em] uppercase mb-4 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
          <Crown className="w-4 h-4" />
          Torneo Finalizado
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Cuadro de Honor
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-stretch">
        {sortedFinals.map((final, idx) => {
          const winner = getWinner(final);
          if (!winner) return null;

          const isGold = (final.cup_name || "").toLowerCase().includes("oro") || idx === 0;
          const isSilver = (final.cup_name || "").toLowerCase().includes("plata");
          
          let gradient = "from-[#1a1c23] to-[#0a0f14]";
          let borderClass = "border-white/10";
          let textGlow = "text-white";
          let icon = <Medal className="w-8 h-8 text-white/50" />;
          let shadow = "shadow-[0_0_30px_rgba(0,0,0,0.5)]";

          if (isGold) {
            gradient = "from-[#ffaa00]/20 via-[#1a1c23] to-[#0a0f14]";
            borderClass = "border-[#ffaa00]/50";
            textGlow = "text-[#ffaa00] drop-shadow-[0_0_10px_rgba(255,170,0,0.8)]";
            icon = <Trophy className="w-10 h-10 text-[#ffaa00] drop-shadow-[0_0_15px_rgba(255,170,0,0.8)]" />;
            shadow = "shadow-[0_0_40px_rgba(255,170,0,0.15)]";
          } else if (isSilver) {
            gradient = "from-[#a7b0ba]/20 via-[#1a1c23] to-[#0a0f14]";
            borderClass = "border-[#a7b0ba]/50";
            textGlow = "text-[#a7b0ba] drop-shadow-[0_0_10px_rgba(167,176,186,0.8)]";
            icon = <Medal className="w-8 h-8 text-[#a7b0ba] drop-shadow-[0_0_10px_rgba(167,176,186,0.8)]" />;
            shadow = "shadow-[0_0_30px_rgba(167,176,186,0.1)]";
          }

          return (
            <motion.div
              key={final.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              onClick={() => {
                if (winner.id) {
                  window.dispatchEvent(new CustomEvent("open-team-modal", { detail: { teamId: winner.id } }));
                }
              }}
              className={`relative bg-gradient-to-b ${gradient} border ${borderClass} rounded-3xl p-8 flex flex-col items-center text-center ${shadow} overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              
              <div className="mb-4">
                {icon}
              </div>
              
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] mb-6">
                Campeón {final.cup_name ? `- ${final.cup_name}` : ""}
              </div>

              <div className="w-24 h-24 bg-black/40 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden mb-6 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
                {winner.logo_url ? (
                  <Image src={winner.logo_url} alt={winner.name} width={80} height={80} className="object-contain" unoptimized />
                ) : (
                  <div className="text-3xl font-black text-white/20">{winner.name.substring(0, 2)}</div>
                )}
              </div>

              <h3 className={`text-2xl font-black uppercase tracking-widest ${textGlow}`}>
                {winner.name}
              </h3>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
