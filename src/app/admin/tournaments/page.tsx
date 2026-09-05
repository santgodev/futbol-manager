"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Users, Plus, ChevronRight, Trophy } from "lucide-react";

function statusColor(status: string) {
  if (status?.includes("CURSO"))  return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (status?.includes("INSCRI")) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
  if (status?.includes("FINALIZ")) return "text-white/30 border-white/10 bg-white/5";
  return "text-amber-400 border-amber-500/40 bg-amber-500/10";
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>("ALL");

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
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Shield className="w-10 h-12 text-[#00f0ff] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

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
              🏆 Gestión
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic leading-none mb-2"
              style={{ textShadow: "0 0 30px rgba(0,240,255,0.15)" }}>
              TORNEOS
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">
              Administra tus ligas y competiciones
            </p>
          </div>
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} /> Crear Torneo
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setSportFilter("ALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${sportFilter === "ALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Todos</button>
        <button onClick={() => setSportFilter("FOOTBALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${sportFilter === "FOOTBALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Fútbol</button>
        <button onClick={() => setSportFilter("VOLLEYBALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${sportFilter === "VOLLEYBALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Voleibol</button>
      </div>

      {/* Tournaments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments?.filter(t => sportFilter === "ALL" || t.sport === sportFilter).map((tournament: any) => (
          <Link
            key={tournament.id}
            href={`/admin/tournaments/${tournament.id}`}
            className="group relative flex flex-col rounded-2xl border border-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all duration-300 overflow-hidden cursor-pointer"
            style={{ background: "rgba(0,17,51,0.65)", backdropFilter: "blur(12px)" }}
          >
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-8 bg-[#00f0ff]/10 blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-6 relative z-10 flex flex-col h-full">
              {/* Icon + status */}
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl border border-[#0055cc]/30 group-hover:border-[#00f0ff]/40 transition-colors"
                  style={{ background: "rgba(0,34,102,0.5)" }}>
                  <Trophy size={22} className="text-[#00f0ff]/60 group-hover:text-[#00f0ff] transition-all group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor(tournament.status)}`}>
                  {tournament.status}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 mb-6">
                <span className="font-black text-lg tracking-wide uppercase text-white group-hover:text-white transition-colors line-clamp-2 leading-tight">
                  {tournament.name}
                </span>
                {tournament.location && (
                  <span className="text-[10px] text-white/35 uppercase tracking-widest mt-1 block">
                    📍 {tournament.location}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-[#00f0ff]/10">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">Equipos</span>
                  <span className="font-black text-white text-lg group-hover:text-[#00f0ff] transition-colors">{(tournament.tournament_teams as any)?.[0]?.count || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">Partidos</span>
                  <span className="font-black text-white text-lg group-hover:text-[#00f0ff] transition-colors">{(tournament.matches as any)?.[0]?.count || 0}</span>
                </div>
                <div className="ml-auto">
                  <ChevronRight size={20} className="text-white/20 group-hover:text-[#00f0ff]/60 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {tournaments?.filter(t => sportFilter === "ALL" || t.sport === sportFilter).length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-[#00f0ff]/15 flex flex-col items-center gap-4"
            style={{ background: "rgba(0,17,51,0.4)" }}>
            <Trophy size={40} className="text-[#00f0ff]/20" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50">No hay torneos creados</h3>
            <p className="text-white/30 text-xs uppercase tracking-widest max-w-md mx-auto">
              Crea tu primer torneo para comenzar a gestionar el campeonato.
            </p>
            <Link href="/admin/tournaments/new" className="btn-premium-teal inline-flex mt-2">
              Crear el primer torneo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
