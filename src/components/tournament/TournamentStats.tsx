"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Shield } from "@/components/ui/Shield";

function AnimatedCounter({ to }: { to: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, to, {
      duration: 2,
      ease: "easeOut",
    });
    return animation.stop;
  }, [count, to]);

  return <motion.span className="text-5xl font-bold text-brand-sand hero-title !not-italic">{rounded}</motion.span>;
}

export const TournamentStats = ({ standings, teamsCount }: { standings: any[], teamsCount: number }) => {
  // Calculate best/worst offense and defense from standings
  if (!standings || standings.length === 0) return null;

  const sortedByOffense = [...standings].sort((a, b) => (b.goals_for || 0) - (a.goals_for || 0));
  const sortedByDefense = [...standings].sort((a, b) => (a.goals_against || 0) - (b.goals_against || 0));

  const bestOffense = sortedByOffense[0];
  const worstOffense = sortedByOffense[sortedByOffense.length - 1];
  const bestDefense = sortedByDefense[0];
  const worstDefense = sortedByDefense[sortedByDefense.length - 1];

  const stats = [
    { title: "Mejor Ofensiva", value: bestOffense.goals_for || 0, team: bestOffense.team?.name, type: "positive" },
    { title: "Mejor Defensiva", value: bestDefense.goals_against || 0, team: bestDefense.team?.name, type: "positive" },
    { title: "Peor Ofensiva", value: worstOffense.goals_for || 0, team: worstOffense.team?.name, type: "negative" },
    { title: "Peor Defensiva", value: worstDefense.goals_against || 0, team: worstDefense.team?.name, type: "negative" },
  ];

  return (
    <section id="stats" className="py-32 border-b border-brand-navy/30 bg-brand-navy/10">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Featured Stats */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua mb-12">Estadísticas Destacadas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  initial={{ y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i} 
                  className="p-8 border border-brand-navy/30 bg-brand-deep relative overflow-hidden group"
                >
                  <div className="relative z-10">
                    <span className="text-[10px] text-brand-aqua/60 uppercase tracking-[0.2em] block mb-6">{stat.title}</span>
                    <div className="flex items-end gap-4 mb-2">
                      <AnimatedCounter to={stat.value} />
                      <span className="text-sm font-medium text-brand-aqua/40 mb-1">Goles</span>
                    </div>
                    <span className={`text-xs font-bold tracking-widest uppercase ${stat.type === 'positive' ? 'text-brand-teal' : 'text-brand-gold'}`}>
                      {stat.team}
                    </span>
                  </div>
                  {/* Decorative large number in background */}
                  <div className="absolute -bottom-4 -right-4 text-[120px] font-bold text-brand-navy/20 hero-title !not-italic pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Teams Grid */}
          <div id="teams">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua mb-12">Equipos Participantes ({teamsCount})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {standings.map((standing, i) => (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  key={standing.team_id} 
                  className="aspect-square border border-brand-navy/30 bg-brand-deep flex flex-col items-center justify-center gap-4 p-4 hover:border-brand-teal transition-colors group cursor-pointer"
                >
                  <Shield className="w-12 h-16 text-brand-aqua/30 group-hover:text-brand-teal transition-colors duration-500" />
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-brand-sand text-center">{standing.team?.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
