import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch recent tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, tournament_teams(count), matches(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white hero-title !not-italic mb-2 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            PANEL DE CONTROL
          </h1>
          <p className="text-[#00f0ff]/60 text-xs font-semibold uppercase tracking-widest">
            Resumen General del Sistema
          </p>
        </div>
        
        <Link 
          href="/admin/tournaments/new"
          className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(0,170,255,0.5)] hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,100,255,0.3)] shrink-0"
        >
          + Crear Torneo
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Stat Card 1 */}
        <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 p-8 rounded-2xl relative overflow-hidden group hover:border-[#00f0ff]/50 hover:bg-[#002255]/20 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066cc]/20 rounded-full blur-[40px] group-hover:bg-[#00f0ff]/20 transition-colors" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/70 font-semibold block mb-2 relative z-10">Torneos Activos</span>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] relative z-10">{tournaments?.length || 0}</span>
        </div>
        
        {/* Stat Card 2 */}
        <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 p-8 rounded-2xl relative overflow-hidden group hover:border-[#00f0ff]/50 hover:bg-[#002255]/20 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066cc]/20 rounded-full blur-[40px] group-hover:bg-[#00f0ff]/20 transition-colors" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/70 font-semibold block mb-2 relative z-10">Equipos Totales</span>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] relative z-10">
            {tournaments?.reduce((acc, t) => acc + (t.tournament_teams?.[0]?.count || 0), 0) || 0}
          </span>
        </div>
        
        {/* Stat Card 3 */}
        <div className="bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 p-8 rounded-2xl relative overflow-hidden group hover:border-[#00f0ff]/50 hover:bg-[#002255]/20 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066cc]/20 rounded-full blur-[40px] group-hover:bg-[#00f0ff]/20 transition-colors" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#00f0ff]/70 font-semibold block mb-2 relative z-10">Partidos Disputados</span>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] relative z-10">
            {tournaments?.reduce((acc, t) => acc + (t.matches?.[0]?.count || 0), 0) || 0}
          </span>
        </div>
      </div>

      {/* Tournaments List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Mis Torneos
          </h2>
          <Link 
            href="/admin/tournaments/new"
            className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-bold hover:text-white transition-colors"
          >
            + Nuevo Torneo
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {tournaments?.map((tournament) => (
            <Link 
              key={tournament.id} 
              href={`/admin/tournaments/${tournament.id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/30 rounded-xl hover:border-[#00f0ff] hover:bg-[#002255]/30 hover:shadow-[0_0_25px_rgba(0,100,255,0.2)] transition-all duration-300"
            >
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <div className="p-3 bg-[#001122] rounded-lg border border-[#0055cc]/20 group-hover:border-[#00f0ff]/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                  <Shield className="w-8 h-10 text-[#0066cc] group-hover:text-[#00f0ff] transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-wide uppercase text-white group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all">
                    {tournament.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                      {/* Indicador de estado (Punto de luz) */}
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0ff]"></span>
                    </span>
                    <span className="text-[10px] text-[#00f0ff]/80 uppercase tracking-widest font-semibold">
                      {tournament.status} <span className="text-white/30 mx-1">•</span> <span className="text-white/60">{tournament.location}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-10 md:gap-16 items-center bg-[#000000]/40 py-3 px-6 rounded-lg border border-white/5">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Equipos</span>
                  <span className="text-xl font-bold text-white group-hover:text-[#00f0ff] transition-colors">{tournament.tournament_teams?.[0]?.count || 0}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Partidos</span>
                  <span className="text-xl font-bold text-white group-hover:text-[#00f0ff] transition-colors">{tournament.matches?.[0]?.count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
          
          {tournaments?.length === 0 && (
            <div className="p-12 bg-[#02060d]/40 rounded-xl border border-dashed border-[#0055cc]/50 text-center flex flex-col items-center justify-center">
              <Shield className="w-16 h-20 text-[#0055cc]/30 mb-6" />
              <span className="text-white/50 text-sm uppercase tracking-widest mb-6 font-semibold">No tienes torneos registrados</span>
              <Link 
                href="/admin/tournaments/new"
                className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(0,170,255,0.4)] transition-all"
              >
                Crear el primer torneo
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
