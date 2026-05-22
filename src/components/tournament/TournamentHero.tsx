"use client";

import { motion } from "framer-motion";
import { Tables } from "@/types/supabase";

interface TournamentHeroProps {
  tournament: Tables<"tournaments"> & { teams_count: number };
}

export const TournamentHero = ({ tournament }: TournamentHeroProps) => {
  return (
    <section className="relative w-full min-h-[50vh] flex flex-col border-b border-[#1e3d70]/30 overflow-hidden bg-[#04080f] py-12">
      {/* Base gradient */}
      <div className="absolute inset-0"
           style={{ background: "linear-gradient(160deg, #020408 0%, #04080f 55%, #060c18 100%)" }}
      />

      {/* Blue atmosphere */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: "radial-gradient(ellipse 50% 90% at 50% 55%, rgba(0,55,160,0.22) 0%, transparent 70%)"
           }}
      />
      
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center p-4 mt-8">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-brand-teal text-xs font-bold tracking-[0.4em] uppercase mb-6 block animate-pulse"
        >
          {tournament.status}
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="hero-title text-[4rem] md:text-[8rem] lg:text-[130px] leading-[0.85] mb-6"
        >
          {tournament.name.split(" ")[0]}<br />
          {tournament.name.split(" ").slice(1).join(" ") && (
            <span className="text-brand-sand">{tournament.name.split(" ").slice(1).join(" ")}</span>
          )}
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center justify-center gap-4 w-full max-w-lg mt-4"
        >
           <div className="flex-1 h-[1px] bg-brand-aqua/30" />
           <p className="text-sm md:text-lg text-brand-aqua/80 tracking-[0.3em] uppercase whitespace-nowrap">
             Futuro Insurance
           </p>
           <div className="flex-1 h-[1px] bg-brand-aqua/30" />
        </motion.div>

        {/* Tournament Quick Info Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center backdrop-blur-md bg-brand-navy/20 p-8 border border-brand-navy/50 rounded-sm"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-brand-aqua/60 uppercase tracking-[0.2em]">Sede</span>
            <span className="text-sm md:text-base font-bold text-brand-sand tracking-widest uppercase">{tournament.location}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-brand-aqua/60 uppercase tracking-[0.2em]">Inicio</span>
            <span className="text-sm md:text-base font-bold text-brand-sand tracking-widest uppercase">{tournament.start_date || "Por definir"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-brand-aqua/60 uppercase tracking-[0.2em]">Equipos</span>
            <span className="text-sm md:text-base font-bold text-brand-sand tracking-widest uppercase">{tournament.teams_count}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-brand-aqua/60 uppercase tracking-[0.2em]">Admin</span>
            <span className="text-sm md:text-base font-bold text-brand-sand tracking-widest uppercase truncate max-w-[120px] mx-auto">{tournament.admin_name}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
