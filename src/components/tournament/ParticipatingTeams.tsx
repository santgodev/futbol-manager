"use strict";
"use client";

import { Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export const ParticipatingTeams = ({ teams }: { teams: any[] }) => {
  if (!teams || teams.length === 0) return null;

  return (
    <section id="teams" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-30" />
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0a1122]/50 border border-[#00f0ff]/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <Users className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white hero-title !not-italic">
              Directorio de Equipos
            </h2>
            <p className="text-[9px] font-mono text-[#cad5d6]/50 uppercase tracking-widest mt-1">
              Clubes Participantes
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {teams.map((t, index) => {
          const team = t.team || t;
          return (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              key={t.id || index}
              className="group flex flex-col items-center justify-center p-6 rounded-2xl relative overflow-hidden transition-all duration-500 cursor-pointer border border-[#00f0ff]/10 bg-gradient-to-b from-[#0a1526]/80 to-[#050810]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-[#00f0ff]/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,240,255,0.15)]"
            >
              {/* Dynamic hover lights */}
              <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_8px_#00f0ff]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[40px] bg-[#00f0ff]/20 blur-[25px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

              {/* Logo Container (Hexagon/Shield aesthetic hint via styling) */}
              <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center relative z-10 bg-[#02060d] rounded-[1.5rem] border border-[#0a1122] shadow-inner overflow-hidden group-hover:border-[#00f0ff]/30 transition-colors duration-500">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-[70%] h-[70%] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Shield className="w-10 h-10 text-[#00f0ff]/20 group-hover:text-[#00f0ff]/60 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all duration-500" />
                )}
              </div>

              {/* Team Name */}
              <span className="font-black text-xs md:text-sm text-center tracking-widest uppercase text-[#e5e1dd] group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all relative z-10 w-full truncate px-2">
                {team.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
