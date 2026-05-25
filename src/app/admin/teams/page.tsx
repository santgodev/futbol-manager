"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Shield } from "lucide-react";
import Link from "next/link";

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
      <div className="p-8 md:p-12 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Shield className="w-10 h-12 text-brand-teal animate-pulse" />
      </div>
    );
  }


  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <Link href="/admin" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver al Dashboard
      </Link>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-navy/30">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#00f0ff] hero-title !not-italic mb-2 drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            CLUBES Y EQUIPOS
          </h1>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
            Directorio global de equipos registrados
          </p>
        </div>
        <Link 
          href="/admin/teams/new"
          className="btn-premium-teal"
        >
          + Registrar Equipo
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {teams?.map((team: any) => {
          const playersCount = (team.players as any)?.[0]?.count || 0;
          return (
            <Link 
              key={team.id} 
              href={`/admin/teams/${team.id}`}
              className="group flex flex-col items-center panel-premium-interactive overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
              <div className="absolute top-0 inset-x-0 h-[60px] bg-brand-teal/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {team.logo_url ? (
                <div className="w-20 h-20 mb-6 flex items-center justify-center relative z-10">
                  <img src={team.logo_url} alt={team.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <Shield className="w-16 h-20 text-brand-aqua/20 group-hover:text-brand-teal transition-colors mb-6 relative z-10" />
              )}
              
              <span className="font-bold text-sm text-center tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors mb-2 relative z-10 line-clamp-1">
                {team.name}
              </span>
              
              <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest text-center relative z-10">
                {playersCount} Jugador{playersCount !== 1 ? 'es' : ''}
              </span>
            </Link>
          );
        })}
      </div>

      {(!teams || teams.length === 0) && (
        <div className="p-12 text-center border border-dashed border-brand-navy/30 bg-brand-deep mt-8">
          <Shield className="w-12 h-16 text-brand-navy/30 mx-auto mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">No hay equipos</h3>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest max-w-md mx-auto">
            Registra tu primer equipo para comenzar a gestionar el torneo.
          </p>
        </div>
      )}
    </div>
  );
}
