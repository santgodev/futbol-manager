"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("tournaments")
        .select("*, tournament_teams(count), matches(count)")
        .order("created_at", { ascending: false });
      if (data) setTournaments(data);
      setLoading(false);
    };
    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="p-8 md:p-12 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Shield className="w-10 h-12 text-brand-teal animate-pulse" />
      </div>
    );
  }


  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <Link href="/admin" className="text-[10px] text-brand-aqua/60 uppercase tracking-widest hover:text-brand-teal transition-colors mb-8 inline-block">
        ← Volver al Dashboard
      </Link>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-navy/30">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-2">
            Gestión de Torneos
          </h1>
          <p className="text-brand-aqua/50 text-xs uppercase tracking-widest">
            Administra tus ligas y competiciones
          </p>
        </div>
        <Link 
          href="/admin/tournaments/new"
          className="btn-premium-teal"
        >
          + Crear Torneo
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments?.map((tournament: any) => (
          <Link 
            key={tournament.id} 
            href={`/admin/tournaments/${tournament.id}`}
            className="group flex flex-col panel-premium-interactive"
          >
            {/* Hover ambient glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/10 blur-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="p-3 bg-[#02060d]/80 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] border border-brand-navy/30 rounded-xl group-hover:border-brand-teal/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all">
                <Shield className="w-8 h-8 text-brand-teal drop-shadow-[0_0_0_rgba(0,0,0,0)] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all" />
              </div>
              <span className="text-[9px] text-brand-teal font-black uppercase tracking-widest border border-brand-teal/30 bg-[#02060d]/80 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.05)]">
                {tournament.status}
              </span>
            </div>
            
            <div className="flex flex-col mb-6 relative z-10">
              <span className="font-bold text-xl tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors mb-1 line-clamp-1 drop-shadow-[0_0_0_rgba(0,0,0,0)] group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                {tournament.name}
              </span>
              <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest group-hover:text-brand-teal/70 transition-colors">
                📍 {tournament.location}
              </span>
            </div>
            
            <div className="flex items-center gap-8 mt-auto pt-5 border-t border-brand-navy/30 relative z-10">
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest mb-1 group-hover:text-brand-aqua/60 transition-colors">Equipos</span>
                <span className="font-bold text-brand-sand text-lg group-hover:text-brand-teal drop-shadow-[0_0_0_rgba(0,0,0,0)] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">{(tournament.tournament_teams as any)?.[0]?.count || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-aqua/40 uppercase tracking-widest mb-1 group-hover:text-brand-aqua/60 transition-colors">Partidos</span>
                <span className="font-bold text-brand-sand text-lg group-hover:text-brand-teal drop-shadow-[0_0_0_rgba(0,0,0,0)] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">{(tournament.matches as any)?.[0]?.count || 0}</span>
              </div>
            </div>
          </Link>
        ))}

        {(!tournaments || tournaments.length === 0) && (
          <div className="col-span-full p-12 text-center border border-dashed border-brand-navy/30 bg-brand-deep">
            <Shield className="w-12 h-16 text-brand-navy/30 mx-auto mb-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-sand mb-2">No hay torneos creados</h3>
            <p className="text-brand-aqua/50 text-xs uppercase tracking-widest max-w-md mx-auto mb-6">
              Crea tu primer torneo para comenzar a gestionar el campeonato.
            </p>
            <Link 
              href="/admin/tournaments/new"
              className="btn-premium-navy inline-flex"
            >
              Crear el primer torneo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
