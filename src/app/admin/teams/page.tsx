"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Shield } from "lucide-react";
import Link from "next/link";
import { Plus, Users, ChevronRight } from "lucide-react";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("teams")
        .select(`
          *, 
          players(count)
        `)
        .order("name", { ascending: true });
      if (data) setTeams(data);
      setLoading(false);
    };
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Shield className="w-10 h-12 text-[#00f0ff] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">

      {/* Back */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] text-[#00f0ff]/50 uppercase tracking-widest hover:text-[#00f0ff] transition-colors mb-6 font-bold">
        ← Dashboard
      </Link>

      {/* Header */}
      <header className="mb-8 relative">
        <div className="absolute -top-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#00f0ff]/50 uppercase tracking-[0.3em] font-bold font-mono mb-2">
              🛡️ Registro Global
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic leading-none mb-2"
              style={{ textShadow: "0 0 30px rgba(0,240,255,0.15)" }}>
              CLUBES Y<br className="md:hidden" /> EQUIPOS
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">
              Directorio global de equipos registrados
            </p>
          </div>
          <Link
            href="/admin/teams/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} /> Registrar Equipo
          </Link>
        </div>
      </header>

      {/* Teams grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {teams?.map((team: any) => {
          const playersCount = (team.players as any)?.[0]?.count || 0;
          return (
            <Link
              key={team.id}
              href={`/admin/teams/${team.id}`}
              className="group relative flex flex-col items-center rounded-2xl border border-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all duration-300 overflow-hidden cursor-pointer p-5"
              style={{ background: "rgba(0,17,51,0.65)", backdropFilter: "blur(12px)" }}
            >
              {/* Top glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 inset-x-0 h-10 bg-[#00f0ff]/10 blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Logo or Shield */}
              {team.logo_url ? (
                <div className="w-16 h-16 mb-4 flex items-center justify-center relative z-10">
                  <img src={team.logo_url} alt={team.name} className="max-w-full max-h-full object-contain filter group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all" />
                </div>
              ) : (
                <Shield className="w-14 h-16 text-[#00f0ff]/20 group-hover:text-[#00f0ff]/50 transition-colors mb-4 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
              )}

              <span className="font-black text-sm text-center tracking-wide uppercase text-white/80 group-hover:text-white transition-colors mb-1.5 relative z-10 line-clamp-2 text-center leading-tight">
                {team.name}
              </span>

              <div className="flex items-center gap-1 mt-auto relative z-10">
                <Users size={10} className="text-[#00f0ff]/40" />
                <span className="text-[9px] text-white/30 uppercase tracking-widest group-hover:text-[#00f0ff]/60 transition-colors">
                  {playersCount} jugador{playersCount !== 1 ? 'es' : ''}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {(!teams || teams.length === 0) && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#00f0ff]/15 flex flex-col items-center gap-4 mt-4"
          style={{ background: "rgba(0,17,51,0.4)" }}>
          <Shield className="w-12 h-16 text-[#00f0ff]/20" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white/50">No hay equipos</h3>
          <p className="text-white/30 text-xs uppercase tracking-widest max-w-md mx-auto">
            Registra tu primer equipo para comenzar.
          </p>
          <Link href="/admin/teams/new" className="btn-premium-teal inline-flex mt-2">
            Registrar primer equipo
          </Link>
        </div>
      )}
    </div>
  );
}
