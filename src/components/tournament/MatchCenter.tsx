"use client";

import { motion } from "framer-motion";
import { Shield } from "@/components/ui/Shield";

export const MatchCenter = ({ matches }: { matches: any[] }) => {
  if (!matches || matches.length === 0) return null;

  const featuredMatch = matches[0];
  const recentMatches = matches.slice(1);

  return (
    <section id="matches" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Premium Section Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Centro de Partidos
          </h2>
        </div>
        <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest">
          Partidos en Vivo & Recientes
        </span>
      </div>

      <div className="text-left mb-6">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-cyan/80 font-mono">
          // ÚLTIMO ENFRENTAMIENTO
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full glass-panel p-8 md:p-12 mb-16 relative overflow-hidden group shadow-[0_0_40px_rgba(0,102,255,0.07)] hover:border-brand-cyan/40 transition-all duration-300"
      >
        {/* Diffuse background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full flex flex-col items-center relative z-10">
          <span className="font-mono font-bold text-xs mb-8 tracking-[0.3em] uppercase text-brand-cyan px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded">
            {featuredMatch.status}
          </span>

          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-8 md:gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center md:justify-end w-full">
              <span className="text-xl md:text-3xl lg:text-4xl font-black italic uppercase tracking-tight text-white text-center md:text-right">
                {featuredMatch.home_team?.name || 'TBD'}
              </span>
              <div className="w-16 h-20 md:w-24 md:h-30 bg-brand-deep/50 border border-white/5 rounded-xl flex items-center justify-center p-3 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                {featuredMatch.home_team?.logo_url ? (
                  <img src={featuredMatch.home_team.logo_url} className="w-full h-full object-contain" alt="" />
                ) : (
                  <Shield className="w-full h-full text-brand-cyan/20" />
                )}
              </div>
            </div>
            
            {/* Score */}
            <div className="flex flex-col items-center justify-center shrink-0 px-4 md:px-8 select-none">
              <div className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter tabular-nums flex items-center gap-4 text-white font-display">
                <span className="drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">{featuredMatch.home_score}</span>
                <span className="text-brand-cyan/40 font-light text-4xl md:text-6xl">-</span>
                <span className="drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">{featuredMatch.away_score}</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center md:justify-start w-full">
              <div className="w-16 h-20 md:w-24 md:h-30 bg-brand-deep/50 border border-white/5 rounded-xl flex items-center justify-center p-3 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                {featuredMatch.away_team?.logo_url ? (
                  <img src={featuredMatch.away_team.logo_url} className="w-full h-full object-contain" alt="" />
                ) : (
                  <Shield className="w-full h-full text-brand-cyan/20" />
                )}
              </div>
              <span className="text-xl md:text-3xl lg:text-4xl font-black italic uppercase tracking-tight text-white text-center md:text-left">
                {featuredMatch.away_team?.name || 'TBD'}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center text-brand-text-muted text-[10px] font-mono tracking-[0.2em] uppercase text-center">
            <span>{featuredMatch.match_date || "Por definir"} • {featuredMatch.match_time ? featuredMatch.match_time.substring(0, 5) + " HRS" : "TBD"}</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Matches Divider */}
      <div className="text-left mb-6">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-cyan/80 font-mono">
          // OTROS ENCUENTROS RECIENTES
        </span>
      </div>

      {/* Recent Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentMatches.map((match, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            key={match.id} 
            className="glass-panel p-5 hover:border-brand-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.02)] hover:shadow-[0_0_25px_rgba(0,240,255,0.08)] transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <span className="text-[9px] text-brand-text-muted font-mono tracking-widest uppercase">{match.match_date || "Por definir"}</span>
                <span className="text-[9px] text-brand-cyan font-mono tracking-widest uppercase font-bold px-2 py-0.5 bg-brand-cyan/10 rounded">{match.status}</span>
              </div>
              <div className="flex flex-col gap-3">
                {/* Home */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-brand-navy border border-brand-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {match.home_team?.logo_url ? (
                        <img src={match.home_team.logo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-brand-cyan/30" />
                      )}
                    </div>
                    <span className="font-bold text-xs text-white uppercase tracking-wider truncate">{match.home_team?.name || 'TBD'}</span>
                  </div>
                  <span className="font-black text-sm text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] font-mono">{match.home_score}</span>
                </div>
                {/* Away */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-brand-navy border border-brand-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {match.away_team?.logo_url ? (
                        <img src={match.away_team.logo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-brand-cyan/30" />
                      )}
                    </div>
                    <span className="font-bold text-xs text-white uppercase tracking-wider truncate">{match.away_team?.name || 'TBD'}</span>
                  </div>
                  <span className="font-black text-sm text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] font-mono">{match.away_score}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
