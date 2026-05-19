"use client";

import { motion } from "framer-motion";
import { Shield } from "@/components/ui/Shield";

interface TournamentStandingsProps {
  standings: any[];
  scorers: any[];
}

export const TournamentStandings = ({ standings, scorers }: TournamentStandingsProps) => {
  return (
    <section id="standings" className="max-w-7xl mx-auto px-4 md:px-12 py-32 border-b border-brand-navy/30">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* League Table */}
        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua mb-12">Clasificación General</h3>
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-brand-navy/50 text-[10px] text-brand-aqua/60 uppercase tracking-widest">
                  <th className="pb-4 pl-4 w-12 text-center">Pos</th>
                  <th className="pb-4">Equipo</th>
                  <th className="pb-4 text-center w-12" title="Partidos Jugados">PJ</th>
                  <th className="pb-4 text-center w-12" title="Victorias">G</th>
                  <th className="pb-4 text-center w-12" title="Empates">E</th>
                  <th className="pb-4 text-center w-12" title="Derrotas">P</th>
                  <th className="pb-4 text-center w-12" title="Goles a Favor">GF</th>
                  <th className="pb-4 text-center w-12" title="Goles en Contra">GC</th>
                  <th className="pb-4 text-center w-12" title="Diferencia de Goles">DG</th>
                  <th className="pb-4 text-center w-16 text-brand-teal">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, i) => {
                  const isTop = i === 0;
                  const gd = (team.goals_for || 0) - (team.goals_against || 0);
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      key={team.team_id} 
                      className={`group border-b border-brand-navy/30 hover:bg-brand-navy/10 transition-colors ${isTop ? 'bg-brand-navy/5' : ''}`}
                    >
                      <td className="py-5 pl-4 text-center">
                        <span className={`text-sm font-bold ${isTop ? 'text-brand-gold' : 'text-brand-aqua/50'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-5 font-bold tracking-wide uppercase text-sm text-brand-sand flex items-center gap-3">
                        {team.team?.logo_url ? (
                          <img src={team.team.logo_url} className="w-6 h-6 object-contain" alt="" />
                        ) : (
                          <Shield className="w-5 h-6 text-brand-aqua/30" />
                        )}
                        {team.team?.name}
                      </td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{team.matches_played}</td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{team.wins}</td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{team.draws}</td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{team.losses}</td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{team.goals_for}</td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{team.goals_against}</td>
                      <td className="py-5 text-center text-xs text-brand-aqua/80">{gd > 0 ? `+${gd}` : gd}</td>
                      <td className="py-5 text-center font-bold text-brand-teal text-lg hero-title !not-italic !tracking-normal">
                        {team.points}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Scorers */}
        <div className="lg:col-span-1">
          <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua mb-12">Goleadores</h3>
          <div className="flex flex-col gap-4">
            {scorers.map((scorer, i) => {
              const isTop = i === 0;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  key={scorer.player_id} 
                  className={`flex items-center gap-4 p-4 border border-brand-navy/30 ${isTop ? 'bg-gradient-to-r from-brand-navy/20 to-transparent border-l-2 border-l-brand-gold' : 'bg-brand-deep'}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-brand-deep border ${isTop ? 'border-brand-gold text-brand-gold' : 'border-brand-navy text-brand-aqua/50'} text-xs font-bold`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="font-bold text-brand-sand text-sm uppercase tracking-wide">{scorer.player?.name}</span>
                    <span className="text-[10px] text-brand-aqua/60 uppercase tracking-[0.2em]">{scorer.team?.name}</span>
                  </div>
                  <div className="text-2xl font-bold text-brand-teal hero-title !not-italic !tracking-normal">
                    {scorer.goals}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
