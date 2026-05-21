import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Shield } from "lucide-react";

export default async function AdminTournamentsPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(count), matches(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative">
      <header className="mb-10 bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(0,100,255,0.08)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0066cc]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic mb-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              GESTIÓN DE TORNEOS
            </h1>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
              Administra tus ligas y competiciones
            </p>
          </div>
          <Link 
            href="/admin/tournaments/new"
            className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,170,255,0.4)] transition-all shrink-0 flex items-center gap-2"
          >
            + Crear Torneo
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments?.map((tournament) => (
          <Link 
            key={tournament.id} 
            href={`/admin/tournaments/${tournament.id}`}
            className="group flex flex-col p-6 bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/30 hover:border-[#00f0ff]/50 hover:bg-[#002255]/20 rounded-2xl transition-all shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.1)] relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-[#001133] rounded-xl border border-[#0055cc]/20 group-hover:border-[#00f0ff]/30 transition-colors">
                <Shield className="w-8 h-8 text-[#0055cc]/50 group-hover:text-[#00f0ff] transition-colors" />
              </div>
              <span className="text-[9px] text-[#00f0ff] font-bold uppercase tracking-widest border border-[#00f0ff]/30 bg-[#001133] px-3 py-1 rounded-full">
                {tournament.status}
              </span>
            </div>
            
            <div className="flex flex-col mb-6">
              <span className="font-black text-xl tracking-wide uppercase text-white group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all mb-1 line-clamp-1">
                {tournament.name}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest">
                📍 {tournament.location}
              </span>
            </div>
            
            <div className="flex items-center gap-8 mt-auto pt-5 border-t border-[#0055cc]/20">
              <div className="flex flex-col">
                <span className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Equipos</span>
                <span className="font-bold text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tournament.tournament_teams?.[0]?.count || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Partidos</span>
                <span className="font-bold text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tournament.matches?.[0]?.count || 0}</span>
              </div>
            </div>
          </Link>
        ))}

        {(!tournaments || tournaments.length === 0) && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-dashed border-[#0055cc]/30 rounded-2xl">
            <Shield size={48} className="text-[#0055cc]/30 mb-4" />
            <span className="text-white/40 text-sm uppercase tracking-widest font-bold mb-4">No hay torneos creados</span>
            <Link 
              href="/admin/tournaments/new"
              className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-bold hover:underline"
            >
              Crea tu primer torneo aquí
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
