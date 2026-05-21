import { createClient } from "@/utils/supabase/server";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  // Get teams with their roster count
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *, 
      players(count)
    `)
    .order("name", { ascending: true });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto relative">
      
      {/* ── Back ── */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={14} /> Volver al Dashboard
      </Link>

      {/* ── Header ── */}
      <header className="mb-10 bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(0,100,255,0.08)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0066cc]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic mb-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              CLUBES Y EQUIPOS
            </h1>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
              Directorio global de equipos registrados
            </p>
          </div>
          <Link 
            href="/admin/teams/new"
            className="bg-gradient-to-r from-[#0066cc] to-[#00aaff] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,170,255,0.4)] transition-all shrink-0"
          >
            + Registrar Equipo
          </Link>
        </div>
      </header>

      {/* ── Teams Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams?.map((team) => {
          const playersCount = team.players?.[0]?.count || 0;
          return (
            <Link 
              key={team.id} 
              href={`/admin/teams/${team.id}`}
              className="group flex flex-col items-center p-6 bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/30 rounded-2xl hover:border-[#00f0ff]/50 hover:bg-[#002255]/20 transition-all shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.1)] relative overflow-hidden"
            >
              {/* Logo */}
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-[#001133] rounded-xl border border-[#0055cc]/20 shadow-inner overflow-hidden">
                {team.logo_url ? (
                  <Image src={team.logo_url} alt={team.name} width={80} height={80} className="object-contain p-2" unoptimized />
                ) : (
                  <Shield size={32} className="text-[#0055cc]/50 group-hover:text-[#00f0ff]/50 transition-colors" />
                )}
              </div>
              
              {/* Info */}
              <span className="font-black text-sm text-center tracking-wide uppercase text-white group-hover:text-[#00f0ff] transition-colors mb-1 line-clamp-1">
                {team.name}
              </span>
              
              {team.city && (
                <span className="text-[9px] text-white/40 uppercase tracking-widest text-center mb-3">
                  📍 {team.city}
                </span>
              )}
              
              {/* Badge */}
              <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#001133] border border-[#0055cc]/30 text-[9px] text-[#00f0ff] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                {playersCount} Jugador{playersCount !== 1 ? 'es' : ''}
              </div>
            </Link>
          );
        })}
        {(!teams || teams.length === 0) && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-dashed border-[#0055cc]/30 rounded-2xl">
            <Shield size={48} className="text-[#0055cc]/30 mb-4" />
            <span className="text-white/40 text-sm uppercase tracking-widest font-bold">No hay equipos registrados</span>
          </div>
        )}
      </div>
    </div>
  );
}
