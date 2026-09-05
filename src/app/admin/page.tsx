"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";
import { Trophy, Users, Calendar, Plus, ChevronRight } from "lucide-react";

function statusColor(status: string) {
  if (status?.includes("CURSO"))  return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (status?.includes("INSCRI")) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
  if (status?.includes("FINALIZ")) return "text-white/30 border-white/10 bg-white/5";
  return "text-amber-400 border-amber-500/40 bg-amber-500/10";
}

export default function AdminDashboard() {
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
        <Shield className="w-10 h-12 text-[#00f0ff] animate-pulse drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
      </div>
    );
  }

  const totalTeams = tournaments?.reduce((acc: number, t: any) => acc + (t.tournament_teams?.[0]?.count || 0), 0) || 0;
  const totalMatches = tournaments?.reduce((acc: number, t: any) => acc + (t.matches?.[0]?.count || 0), 0) || 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* ── Hero Header ── */}
      <header className="mb-10 pt-4 relative">
        {/* Top glow line */}
        <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#00f0ff]/60 uppercase tracking-[0.35em] font-bold font-mono mb-2">
              ⚡ Control Center
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white hero-title !not-italic leading-none mb-3"
              style={{ textShadow: "0 0 40px rgba(0,240,255,0.2)" }}>
              PANEL DE<br />
              <span className="text-[#00f0ff]">CONTROL</span>
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">
              Resumen general del sistema
            </p>
          </div>
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} /> Nuevo Torneo
          </Link>
        </div>
      </header>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
        {[
          { label: "Torneos", value: tournaments?.length || 0, icon: Trophy, color: "#00f0ff" },
          { label: "Equipos", value: totalTeams, icon: Users, color: "#0088ff" },
          { label: "Partidos", value: totalMatches, icon: Calendar, color: "#00f0ff" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative rounded-2xl overflow-hidden border border-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all duration-300" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}>
              {/* Top glow line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Hover glow blob */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-8 bg-[#00f0ff]/15 blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-5 md:p-6 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} className="text-[#00f0ff]/60" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">{stat.label}</span>
                </div>
                <span className="text-3xl md:text-5xl font-black text-white hero-title !not-italic transition-all group-hover:text-[#00f0ff]"
                  style={{ textShadow: "0 0 20px rgba(0,240,255,0.1)" }}>
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tournaments List ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00f0ff] to-[#0055cc] rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Mis Torneos</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#00f0ff]/20 to-transparent" />
          <Link
            href="/admin/tournaments"
            className="text-[10px] text-[#00f0ff]/60 uppercase tracking-widest hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-bold"
          >
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setSportFilter("ALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${sportFilter === "ALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Todos</button>
          <button onClick={() => setSportFilter("FOOTBALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${sportFilter === "FOOTBALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Fútbol</button>
          <button onClick={() => setSportFilter("VOLLEYBALL")} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${sportFilter === "VOLLEYBALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Voleibol</button>
        </div>

        <div className="flex flex-col gap-3">
          {tournaments?.filter(t => sportFilter === "ALL" || t.sport === sportFilter).map((tournament: any) => (
            <Link
              key={tournament.id}
              href={`/admin/tournaments/${tournament.id}`}
              className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 p-5 rounded-2xl border border-[#00f0ff]/10 hover:border-[#00f0ff]/25 transition-all duration-300 overflow-hidden cursor-pointer"
              style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}
            >
              {/* Top glow on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#00f0ff]/10 blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center gap-4 relative z-10">
                {/* Shield icon */}
                <div className="shrink-0 w-10 h-10 rounded-xl border border-[#0055cc]/30 flex items-center justify-center group-hover:border-[#00f0ff]/40 transition-colors"
                  style={{ background: "rgba(0,34,102,0.5)" }}>
                  <Shield className="w-5 h-7 text-[#00f0ff]/50 group-hover:text-[#00f0ff] transition-colors group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-base tracking-wide uppercase text-white group-hover:text-white transition-colors truncate leading-tight">
                    {tournament.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusColor(tournament.status)}`}>
                      {tournament.status}
                    </span>
                    {tournament.location && (
                      <span className="text-[10px] text-white/30 uppercase tracking-widest truncate">
                        📍 {tournament.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-around md:justify-end gap-8 md:gap-10 text-center border-t md:border-none border-[#00f0ff]/10 pt-4 md:pt-0 relative z-10">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest mb-0.5">Equipos</span>
                  <span className="font-black text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tournament.tournament_teams?.[0]?.count || 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest mb-0.5">Partidos</span>
                  <span className="font-black text-white text-lg group-hover:text-[#00f0ff] transition-colors">{tournament.matches?.[0]?.count || 0}</span>
                </div>
                <ChevronRight size={18} className="text-white/20 group-hover:text-[#00f0ff]/60 transition-all group-hover:translate-x-1" />
              </div>
            </Link>
          ))}

          {tournaments?.filter(t => sportFilter === "ALL" || t.sport === sportFilter).length === 0 && (
            <div className="p-12 rounded-2xl border border-dashed border-[#00f0ff]/15 text-center flex flex-col items-center justify-center gap-4"
              style={{ background: "rgba(0,17,51,0.4)" }}>
              <Shield className="w-12 h-16 text-[#00f0ff]/20" />
              <span className="text-white/40 text-xs uppercase tracking-widest">No hay torneos registrados</span>
              <Link href="/admin/tournaments/new" className="btn-premium-teal !py-2.5 !px-6">
                Crear el primer torneo
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
