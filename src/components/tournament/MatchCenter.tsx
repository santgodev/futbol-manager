"use client";

import { motion } from "framer-motion";
import { Shield } from "@/components/ui/Shield";

export const MatchCenter = ({ matches }: { matches: any[] }) => {
  if (!matches || matches.length === 0) return null;

  const featuredMatch = matches[0];
  const recentMatches = matches.slice(1);

  return (
    <section id="matches" className="max-w-7xl mx-auto px-4 md:px-12 py-32 border-b border-brand-navy/30">
      <div className="flex items-center justify-center gap-4 mb-24 opacity-50">
        <div className="h-[1px] flex-1 bg-brand-navy" />
        <span className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua">Último Partido</span>
        <div className="h-[1px] flex-1 bg-brand-navy" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center w-full mb-32"
      >
        <div className="w-full flex flex-col items-center">
          <span className="font-bold text-sm mb-12 tracking-[0.4em] uppercase text-brand-teal">
            {featuredMatch.status}
          </span>

          <div className="flex items-center justify-between w-full max-w-6xl gap-4">
            <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">
              <span className="text-2xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-brand-sand">{featuredMatch.home_team?.name || 'TBD'}</span>
              {featuredMatch.home_team?.logo_url ? (
                <img src={featuredMatch.home_team.logo_url} className="w-16 h-20 md:w-28 md:h-36 object-contain shrink-0" alt="" />
              ) : (
                <Shield className="w-16 h-20 md:w-28 md:h-36 text-brand-sand/80 shrink-0" />
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center shrink-0 px-4 md:px-8">
              <div className="text-6xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter tabular-nums flex items-center gap-4 text-brand-sand hero-title !not-italic !tracking-normal">
                <span>{featuredMatch.home_score}</span>
                <span className="text-brand-aqua/20 font-light text-4xl md:text-8xl">-</span>
                <span>{featuredMatch.away_score}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8 flex-1 justify-start">
              {featuredMatch.away_team?.logo_url ? (
                <img src={featuredMatch.away_team.logo_url} className="w-16 h-20 md:w-28 md:h-36 object-contain shrink-0" alt="" />
              ) : (
                <Shield className="w-16 h-20 md:w-28 md:h-36 text-brand-sand/80 shrink-0" />
              )}
              <span className="text-2xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-brand-sand">{featuredMatch.away_team?.name || 'TBD'}</span>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center text-brand-aqua/60 text-xs tracking-[0.3em] uppercase text-center">
            <span>{featuredMatch.match_date} • {featuredMatch.match_time?.substring(0, 5)} hrs</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recentMatches.map((match, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            key={match.id} 
            className="border border-brand-navy/30 bg-brand-navy/5 p-6 hover:bg-brand-navy/20 transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] text-brand-aqua/50 tracking-[0.2em] uppercase">{match.match_date}</span>
              <span className="text-[10px] text-brand-teal tracking-[0.2em] uppercase font-bold">{match.status}</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {match.home_team?.logo_url ? (
                    <img src={match.home_team.logo_url} className="w-6 h-8 object-contain" alt="" />
                  ) : (
                    <Shield className="w-6 h-8 text-brand-aqua/70" />
                  )}
                  <span className="font-semibold text-brand-sand tracking-wide uppercase">{match.home_team?.name || 'TBD'}</span>
                </div>
                <span className="font-bold text-xl text-brand-sand hero-title !not-italic !tracking-normal">{match.home_score}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {match.away_team?.logo_url ? (
                    <img src={match.away_team.logo_url} className="w-6 h-8 object-contain" alt="" />
                  ) : (
                    <Shield className="w-6 h-8 text-brand-aqua/70" />
                  )}
                  <span className="font-semibold text-brand-sand tracking-wide uppercase">{match.away_team?.name || 'TBD'}</span>
                </div>
                <span className="font-bold text-xl text-brand-sand hero-title !not-italic !tracking-normal">{match.away_score}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
