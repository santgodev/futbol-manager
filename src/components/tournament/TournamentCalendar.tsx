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
    <section id="calendar" className="py-32 border-b border-brand-navy/30">
      <div className="max-w-4xl mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-brand-aqua mb-6">Próximos Enfrentamientos</h3>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic">
            CALENDARIO OFICIAL
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-brand-navy/50 -translate-x-1/2" />
          
          <div className="flex flex-col gap-16">
            {calendarData.map((day, dayIdx) => (
              <div key={day.rawDate} className="relative">
                <div className="sticky top-20 z-20 flex justify-start md:justify-center mb-8">
                  <div className="bg-brand-teal text-brand-deep text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full -ml-3 md:ml-0 shadow-[0_0_20px_rgba(35,210,203,0.2)]">
                    {day.date}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {day.matches.map((match: any, matchIdx: number) => {
                    const isLeft = matchIdx % 2 === 0;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        key={match.id} 
                        className={`flex flex-col md:flex-row ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 w-full`}
                      >
                        <div className={`w-full md:w-1/2 flex ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                          <div className="bg-brand-navy/10 border border-brand-navy/30 p-6 hover:border-brand-aqua/50 transition-colors group w-full max-w-sm">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-brand-aqua text-[10px] uppercase tracking-widest font-bold">
                                {match.match_time?.substring(0, 5)} hrs
                              </span>
                              <span className={`text-[9px] uppercase tracking-widest ${match.status === 'FINAL' ? 'text-brand-gold' : 'text-brand-aqua/50'}`}>
                                {match.status}
                              </span>
                            </div>
                            <div className="text-brand-sand font-semibold text-sm tracking-wide uppercase">
                              {match.home_team?.name} <span className="text-brand-aqua/40 mx-2">vs</span> {match.away_team?.name}
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block w-4 h-4 rounded-full border-2 border-brand-teal bg-brand-deep z-10 shrink-0" />
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
