import { Trophy, Calendar, MapPin, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const FeaturedTournamentCard = ({ tournament, isPublic }: { tournament?: any; isPublic?: boolean }) => {
  if (!tournament) {
    return (
      <div className="glass-panel w-full h-full min-h-[410px] p-6 flex flex-col items-center justify-center relative overflow-hidden group">
        <span className="text-white/40 text-xs uppercase tracking-widest font-bold text-center">
          No hay torneos activos
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[410px] rounded-xl overflow-hidden group flex flex-col border border-brand-cyan/20">
      {/* Background with Logo / Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
      
      {tournament.image_url && (
        <div className="absolute top-4 right-4 w-32 h-32 opacity-10 pointer-events-none">
          <Image src={tournament.image_url} alt="Logo" fill className="object-contain" unoptimized />
        </div>
      )}

      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-[#001122] transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-transparent" />

      {/* Content wrapper */}
      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        {/* Top: title */}
        <div>
          <div className="mt-5 space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-brand-cyan/20 border border-brand-cyan/40 rounded text-[10px] font-mono font-bold text-brand-cyan tracking-widest uppercase">
              ACTUAL
            </span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mt-4">
              {tournament.name}
            </h3>
            <p className="text-xs text-brand-text-muted mt-2 font-medium tracking-wide flex items-center gap-1">
              <MapPin size={12}/> {tournament.location || "Sede Principal"}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-5">
          {isPublic ? (
            <a 
              href="#matches"
              className="flex-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-cyan hover:text-brand-deep transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
            >
              Ver Partidos
              <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </a>
          ) : (
            <Link 
              href={`/admin/tournaments/${tournament.id}`}
              className="flex-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-cyan hover:text-brand-deep transition-all flex items-center justify-center gap-2 group/btn"
            >
              Ver Torneo
              <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
