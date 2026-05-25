"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Users, Star, Trophy, Gamepad2, Activity } from "lucide-react";

export function FeaturedTournamentsCarousel({ tournaments, title = "Torneos Destacados" }: { tournaments: any[], title?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="w-full relative py-6 select-none flex flex-col items-center justify-center min-h-[300px]">
        <Trophy className="w-12 h-12 text-[#0088ff]/20 mb-4" />
        <h2 className="text-xl font-bold text-white/70">No se encontraron torneos</h2>
        <p className="text-white/40 text-sm mt-2">Intenta con otros términos de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative py-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Torneos Destacados
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tournaments.map((tournament, idx) => {
          // Static mock data for now, until DB has these fields
          const isEsports = idx % 2 !== 0;
          const sportName = isEsports ? "Esports" : "Soccer";
          const SportIcon = isEsports ? Gamepad2 : Trophy;
          const teamsCount = 8 + ((idx * 7) % 20); // Pseudo-random consistent between server and client

          return (
            <Link 
              key={tournament.id}
              href={`/t/${tournament.slug || tournament.id}`}
              className="snap-start shrink-0 w-[300px] md:w-[380px] h-[220px] md:h-[260px] rounded-2xl bg-[#030812] border-2 border-[#0088ff]/30 hover:border-[#0088ff] transition-all duration-300 group overflow-hidden shadow-[0_0_15px_rgba(0,136,255,0.1)] hover:shadow-[0_0_25px_rgba(0,136,255,0.4)] relative flex flex-col justify-end"
            >
              {/* Background Image that fills the entire card */}
              <div className="absolute inset-0 z-0">
                {tournament.image_url ? (
                  <img 
                    src={tournament.image_url} 
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-70 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-[#040814] flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-in-out">
                    <div className="w-full h-full bg-gradient-to-br from-[#0088ff]/10 to-[#0055cc]/20 flex items-center justify-center">
                      <Activity className="w-16 h-16 text-[#0088ff]/20" />
                    </div>
                  </div>
                )}
                
                {/* Dark Gradient Overlay for text readability at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050a] via-[#02050a]/70 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />
              </div>

              {/* Status Badge Top Left */}
              {tournament.status === 'ACTIVE' && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#0088ff]/20 border border-[#0088ff]/50 rounded-full backdrop-blur-md">
                  <span className="text-[10px] font-black text-[#0088ff] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,136,255,0.8)]">En Curso</span>
                </div>
              )}

              {/* Content overlaid on bottom */}
              <div className="relative z-10 p-5 w-full flex flex-col gap-2">
                <h3 className="text-white font-bold text-xl truncate group-hover:text-[#0088ff] transition-colors drop-shadow-md">
                  {tournament.name}
                </h3>
                
                <div className="flex items-center gap-4 text-[#0088ff]/80">
                  <div className="flex items-center gap-1.5">
                    <SportIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide">{sportName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium truncate max-w-[120px]">{tournament.location || "Online"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{teamsCount} Equipos</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#00bfff] to-[#00f0ff] text-black font-bold text-[10px] sm:text-xs rounded-md shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    VER EN VIVO
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* CSS to hide scrollbar for webkit */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}
