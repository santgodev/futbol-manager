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
      <div className="w-full flex flex-col items-center justify-center min-h-[280px] rounded-[2rem] border border-[#018ABE]/30 bg-[#02457A]/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <Trophy className="w-10 h-10 text-[#018ABE] mb-3" />
        <p className="text-[#97CADB] text-[14px] font-bold tracking-wide">No hay torneos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <span className="px-3 py-1 rounded-full bg-[#018ABE]/20 border border-[#018ABE]/40 text-xs font-bold text-[#97CADB] shadow-sm">
            {tournaments.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#018ABE]/30 bg-[#02457A] text-[#97CADB] hover:text-white hover:bg-[#018ABE]/50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#018ABE]/30 bg-[#02457A] text-[#97CADB] hover:text-white hover:bg-[#018ABE]/50 transition-all shadow-sm"
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
            className="snap-start shrink-0 w-[300px] md:w-[340px] rounded-[2rem] border border-[#018ABE]/30 bg-[#02457A]/60 backdrop-blur-xl overflow-hidden group hover:border-[#97CADB]/60 transition-all duration-300 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(1,138,190,0.2)]"
          >
            {/* Image area */}
            <div className="relative h-[180px] overflow-hidden bg-[#001B48]">
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#02457A] via-transparent to-transparent opacity-90" />

              {/* Status */}
              {tournament.status === "ACTIVE" && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#97CADB]/20 border border-[#97CADB]/40 backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#D6E8EE] animate-pulse" />
                  <span className="text-xs font-bold text-[#D6E8EE] tracking-wide">En curso</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-5 flex-1 relative z-10">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white text-lg leading-snug group-hover:text-[#97CADB] transition-colors line-clamp-2">
                  {tournament.name}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-[#97CADB]/60 shrink-0 group-hover:text-[#97CADB] transition-colors mt-0.5" />
              </div>

              <div className="flex items-center gap-4 text-[#D6E8EE] text-xs font-semibold">
                {tournament.location && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#001B48]/50 rounded-full border border-[#018ABE]/30">
                    <MapPin className="w-3.5 h-3.5 text-[#018ABE]" />
                    {tournament.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#001B48]/50 rounded-full border border-[#018ABE]/30">
                  <Trophy className="w-3.5 h-3.5 text-[#018ABE]" />
                  {tournament.sport === "VOLEIBOL" ? "Voleibol" : "Fútbol"}
                </span>
              </div>

              <div className="mt-auto pt-4 border-t border-[#018ABE]/30 flex items-center justify-between">
                <span className="text-xs font-bold text-[#97CADB] tracking-wide uppercase">Ver torneo</span>
                <div className="flex items-center gap-1.5 text-[#D6E8EE] text-xs font-bold px-3 py-1.5 bg-[#018ABE]/40 rounded-full group-hover:bg-[#018ABE] group-hover:text-white transition-all">
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
