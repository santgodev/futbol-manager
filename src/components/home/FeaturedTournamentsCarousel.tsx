"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Trophy, ArrowUpRight } from "lucide-react";

type FeaturedTournament = {
  id: string;
  slug?: string | null;
  name: string;
  image_url?: string | null;
  status?: string | null;
  location?: string | null;
  sport?: string | null;
};

function getSportLabel(sport?: string | null) {
  switch (sport) {
    case "VOLLEYBALL":
      return "Voleibol";
    case "BEACH_VOLLEYBALL":
      return "Voleibol playa";
    case "FOOTBALL":
      return "Fútbol";
    default:
      return "Deporte";
  }
}

function getSportFallbackImage(sport?: string | null) {
  switch (sport) {
    case "VOLLEYBALL":
    case "BEACH_VOLLEYBALL":
      return "/images/volleyball-card-fallback.png";
    case "FOOTBALL":
    default:
      return "/soccer_hero_bg_1779231892022.png";
  }
}

function getFallbackImagePosition(sport?: string | null) {
  return sport === "FOOTBALL" ? "center 35%" : "center";
}

export function FeaturedTournamentsCarousel({
  tournaments,
  title = "Torneos Destacados",
}: {
  tournaments: FeaturedTournament[];
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
      <div className="w-full flex flex-col items-center justify-center min-h-[280px] rounded-2xl border border-[#202830] bg-[#0a0f14]">
        <Trophy className="w-10 h-10 text-[#202830] mb-3" />
        <p className="text-[#707b86] text-[14px] font-medium">No hay torneos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-bold text-white tracking-tight">{title}</h2>
          <span className="px-2 py-0.5 rounded-full bg-[#0a84ff]/10 border border-[#0a84ff]/25 text-[11px] font-semibold text-[#0a84ff]">
            {tournaments.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#202830] text-[#707b86] hover:text-white hover:border-[#2c3540] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#202830] text-[#707b86] hover:text-white hover:border-[#2c3540] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tournaments.map((tournament) => {
          const hasTournamentImage = Boolean(tournament.image_url);
          const imageSrc = tournament.image_url || getSportFallbackImage(tournament.sport);

          return (
            <Link
              key={tournament.id}
              href={`/t/${tournament.slug || tournament.id}`}
              className="snap-start shrink-0 w-[300px] md:w-[340px] rounded-2xl border border-[#202830] bg-[#0a0f14] overflow-hidden group hover:border-[#0a84ff]/40 transition-all duration-200 flex flex-col"
            >
              {/* Image area */}
              <div className="relative h-[160px] overflow-hidden bg-[#0f151c]">
                <img
                  src={imageSrc}
                  alt={tournament.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  style={{ objectPosition: hasTournamentImage ? "center" : getFallbackImagePosition(tournament.sport) }}
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-transparent" />

                {/* Status */}
                {tournament.status === "ACTIVE" && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-[10.5px] font-semibold text-[#22c55e]">En curso</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-[15px] leading-snug group-hover:text-[#0a84ff] transition-colors line-clamp-2">
                    {tournament.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-[#707b86] shrink-0 group-hover:text-[#0a84ff] transition-colors mt-0.5" />
                </div>

                <div className="flex items-center gap-4 text-[#707b86] text-[12.5px]">
                  {tournament.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {tournament.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    {getSportLabel(tournament.sport)}
                  </span>
                </div>

                <div className="mt-auto pt-3 border-t border-[#202830] flex items-center justify-between">
                  <span className="text-[11.5px] text-[#707b86]">Ver torneo</span>
                  <div className="flex items-center gap-1 text-[#0a84ff] text-[11.5px] font-semibold">
                    Entrar
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.snap-x::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
}
