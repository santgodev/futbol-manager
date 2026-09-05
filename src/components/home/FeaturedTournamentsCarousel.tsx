"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Users, Trophy, Activity, ArrowUpRight } from "lucide-react";

export function FeaturedTournamentsCarousel({
  tournaments,
  title = "Torneos Destacados",
}: {
  tournaments: any[];
  title?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8,
        behavior: "smooth",
      });
    }
  };

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[280px] rounded-[2rem] border border-[#3A3D55]/50 bg-[#24273A]/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <Trophy className="w-10 h-10 text-[#44485F] mb-3" />
        <p className="text-slate-400 text-[14px] font-bold tracking-wide">No hay torneos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <span className="px-3 py-1 rounded-full bg-[#a5b4fc]/20 border border-[#a5b4fc]/30 text-xs font-bold text-[#a5b4fc] shadow-sm">
            {tournaments.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#44485F] bg-[#2A2E43] text-slate-300 hover:text-white hover:bg-[#34384C] hover:border-[#a5b4fc]/50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#44485F] bg-[#2A2E43] text-slate-300 hover:text-white hover:bg-[#34384C] hover:border-[#a5b4fc]/50 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tournaments.map((tournament) => (
          <Link
            key={tournament.id}
            href={`/t/${tournament.slug || tournament.id}`}
            className="snap-start shrink-0 w-[300px] md:w-[340px] rounded-[2rem] border border-[#3A3D55]/50 bg-[#24273A]/90 overflow-hidden group hover:border-[#a5b4fc]/50 transition-all duration-300 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(165,180,252,0.15)]"
          >
            {/* Image area */}
            <div className="relative h-[180px] overflow-hidden bg-[#1F2233]">
              {tournament.image_url ? (
                <img
                  src={tournament.image_url}
                  alt={tournament.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Activity className="w-12 h-12 text-[#202830]" />
                </div>
              )}
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#24273A] via-transparent to-transparent opacity-90" />

              {/* Status */}
              {tournament.status === "ACTIVE" && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-300 tracking-wide">En curso</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-5 flex-1 relative z-10">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white text-lg leading-snug group-hover:text-[#a5b4fc] transition-colors line-clamp-2">
                  {tournament.name}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-[#a5b4fc] transition-colors mt-0.5" />
              </div>

              <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold">
                {tournament.location && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2A2E43] rounded-full border border-[#3A3D55]/50">
                    <MapPin className="w-3.5 h-3.5 text-[#a5b4fc]" />
                    {tournament.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2A2E43] rounded-full border border-[#3A3D55]/50">
                  <Trophy className="w-3.5 h-3.5 text-[#a5b4fc]" />
                  {tournament.sport === "VOLEIBOL" ? "Voleibol" : "Fútbol"}
                </span>
              </div>

              <div className="mt-auto pt-4 border-t border-[#3A3D55]/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Ver torneo</span>
                <div className="flex items-center gap-1.5 text-[#a5b4fc] text-xs font-bold px-3 py-1.5 bg-[#a5b4fc]/10 rounded-full group-hover:bg-[#a5b4fc] group-hover:text-white transition-all">
                  Entrar
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.snap-x::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
}
