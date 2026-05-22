"use client";

import { motion } from "framer-motion";

export const TournamentCalendar = ({ matches }: { matches: any[] }) => {
  // Agrupar partidos por fecha
  const groupedMatches = matches.reduce((acc, match) => {
    const date = match.match_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {} as Record<string, any[]>);

  // Convertir a un array ordenado
  const calendarData = Object.keys(groupedMatches)
    .filter(date => date !== "null" && date !== "undefined")
    .sort()
    .map(date => {
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        
        const formattedDate = new Intl.DateTimeFormat('es-ES', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }).format(d);
        
        return {
          date: formattedDate,
          rawDate: date,
          matches: groupedMatches[date]
        };
      } catch (e) {
        return null;
      }
    })
    .filter((day): day is { date: string; rawDate: string; matches: any[] } => day !== null);

  if (calendarData.length === 0) return null;

  return (
    <section id="calendar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-12 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Calendario Oficial
          </h2>
        </div>
        <span className="text-[10px] font-mono text-brand-cyan/60 uppercase tracking-widest">
          Encuentros Programados
        </span>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Neon Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-brand-cyan/20 -translate-x-1/2 pointer-events-none" />
          
          <div className="flex flex-col gap-12">
            {calendarData.map((day, dayIdx) => (
              <div key={day.rawDate} className="relative">
                {/* Day Pill */}
                <div className="sticky top-20 z-20 flex justify-start md:justify-center mb-6">
                  <div className="bg-brand-blue text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full -ml-3 md:ml-0 shadow-[0_0_20px_rgba(0,102,255,0.3)] border border-brand-cyan/20 select-none">
                    {day.date}
                  </div>
                </div>
 
                <div className="flex flex-col gap-4">
                  {day.matches.map((match: any, matchIdx: number) => {
                    const isLeft = matchIdx % 2 === 0;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: isLeft ? -15 : 15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        key={match.id} 
                        className={`flex flex-col md:flex-row ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 md:gap-8 w-full`}
                      >
                        <div className={`w-full md:w-1/2 flex ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                          <div className="glass-panel p-5 hover:border-brand-cyan/40 transition-all duration-300 w-full max-w-sm group shadow-[0_0_15px_rgba(0,240,255,0.01)]">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                              <span className="text-brand-cyan font-mono text-[10px] uppercase tracking-widest font-bold">
                                {match.match_time ? match.match_time.substring(0, 5) + " HRS" : "TBD"}
                              </span>
                              <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded ${match.status === 'FINAL' ? 'bg-brand-yellow/15 text-brand-yellow' : 'bg-brand-cyan/10 text-brand-cyan/60'}`}>
                                {match.status}
                              </span>
                            </div>
                            <div className="text-white font-bold text-xs tracking-wider uppercase flex items-center justify-between">
                              <span className="truncate max-w-[120px]">{match.home_team?.name}</span>
                              <span className="text-brand-cyan/30 mx-2 font-mono font-light text-[10px] shrink-0">VS</span>
                              <span className="truncate max-w-[120px] text-right">{match.away_team?.name}</span>
                            </div>
                          </div>
                        </div>
                        {/* Glow timelines bullet */}
                        <div className="hidden md:block w-4 h-4 rounded-full border-2 border-brand-cyan bg-brand-deep z-10 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                        <div className="hidden md:block w-full md:w-1/2" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
