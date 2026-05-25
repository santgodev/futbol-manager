"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";

export default function AdminDashboard() {
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
      <header className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-sand hero-title !not-italic mb-4">
          PANEL DE CONTROL
        </h1>
        <p className="text-brand-aqua/60 text-sm uppercase tracking-widest">
          Resumen General del Sistema
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="panel-stat group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/20 blur-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/60 block mb-4 relative z-10">Torneos Activos</span>
          <span className="text-5xl font-bold text-brand-sand hero-title !not-italic drop-shadow-[0_0_10px_rgba(0,240,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.6)] group-hover:text-white transition-all relative z-10">{tournaments?.length || 0}</span>
        </div>
        <div className="panel-stat group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/20 blur-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/60 block mb-4 relative z-10">Equipos Totales</span>
          <span className="text-5xl font-bold text-brand-sand hero-title !not-italic drop-shadow-[0_0_10px_rgba(0,240,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.6)] group-hover:text-white transition-all relative z-10">
            {tournaments?.reduce((acc: number, t: any) => acc + (t.tournament_teams?.[0]?.count || 0), 0) || 0}
          </span>
        </div>
        <div className="panel-stat group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/20 blur-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-aqua/60 block mb-4 relative z-10">Partidos Disputados</span>
          <span className="text-5xl font-bold text-brand-sand hero-title !not-italic drop-shadow-[0_0_10px_rgba(0,240,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.6)] group-hover:text-white transition-all relative z-10">
            {tournaments?.reduce((acc: number, t: any) => acc + (t.matches?.[0]?.count || 0), 0) || 0}
          </span>
        </div>
      </div>

      {/* Tournaments List */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-lg font-bold tracking-widest uppercase text-brand-sand">Mis Torneos</h2>
          <Link 
            href="/admin/tournaments/new"
            className="btn-premium-teal !py-2 !px-6 w-full md:w-auto"
          >
            + Nuevo Torneo
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {tournaments?.map((tournament: any) => (
            <Link 
              key={tournament.id} 
              href={`/admin/tournaments/${tournament.id}`}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0 panel-premium-interactive"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-brand-teal/10 blur-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 md:gap-6 relative z-10">
                <Shield className="w-8 h-10 text-brand-aqua/30 group-hover:text-brand-teal drop-shadow-[0_0_0_rgba(0,0,0,0)] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all flex-shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-lg tracking-wide uppercase text-brand-sand group-hover:text-white transition-colors truncate">
                    {tournament.name}
                  </span>
                  <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest truncate group-hover:text-brand-teal/70 transition-colors">
                    {tournament.status} • {tournament.location}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-around md:justify-end gap-6 md:gap-12 text-center w-full md:w-auto border-t md:border-none border-brand-navy/30 pt-4 md:pt-0">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest mb-1">Equipos</span>
                  <span className="font-bold text-brand-sand text-lg md:text-base">{tournament.tournament_teams?.[0]?.count || 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-brand-aqua/50 uppercase tracking-widest mb-1">Partidos</span>
                  <span className="font-bold text-brand-sand text-lg md:text-base">{tournament.matches?.[0]?.count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
          
          {tournaments?.length === 0 && (
            <div className="p-12 border border-dashed border-brand-navy/50 text-center flex flex-col items-center justify-center">
              <span className="text-brand-aqua/50 text-sm uppercase tracking-widest mb-4">No hay torneos registrados</span>
              <Link 
                href="/admin/tournaments/new"
                className="btn-premium-navy"
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
