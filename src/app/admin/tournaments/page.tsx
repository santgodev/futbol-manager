"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield, Users, Plus, ChevronRight, Trophy, ShieldAlert, ArrowLeft } from "lucide-react";
import { getCurrentUserProfile, type UserProfileWithMemberships } from "../pegasight-actions";

function statusColor(status: string) {
  if (status?.includes("CURSO"))  return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (status?.includes("INSCRI")) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
  if (status?.includes("FINALIZ")) return "text-white/30 border-white/10 bg-white/5";
  return "text-amber-400 border-amber-500/40 bg-amber-500/10";
}

export default function AdminTournamentsPage() {
  const [profile, setProfile] = useState<UserProfileWithMemberships | null>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);

        if (userProfile?.role === "USUARIO_DE_RESULTADOS") {
          // No debe administrar torneos
          setTournaments([]);
          return;
        }

        const supabase = createClient();
        let query = supabase
          .from("tournaments")
          .select("*, tournament_teams(count), matches(count)")
          .order("created_at", { ascending: false });

        if (userProfile?.role === "ADMINISTRADOR_DEL_TORNEO") {
          const assignedIds = userProfile.memberships
            .filter(m => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE")
            .map(m => m.tournament_id);

          if (assignedIds.length === 0) {
            setTournaments([]);
            return;
          }
          query = query.in("id", assignedIds);
        }

        const { data } = await query;
        if (data) setTournaments(data);
      } catch (err) {
        console.error("Error cargando torneos:", err);
      } finally {
        setLoading(false);
      }
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

  // Si es Usuario de Resultados, bloquear acceso a administración de torneos
  if (profile?.role === "USUARIO_DE_RESULTADOS") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Acceso Exclusivo para Administradores
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            Tu rol es <span className="text-purple-400 font-bold">Usuario de Resultados</span>. Las funciones de configuración, creación y edición de torneos están reservadas para los administradores.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/admin/my-matches"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-[#00f0ff] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Ir a Mis Partidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isGlobalAdmin = profile?.role === "ADMINISTRADOR_GENERAL" || profile?.role === "SUPERADMINISTRADOR";
  const isTournamentAdmin = profile?.role === "ADMINISTRADOR_DEL_TORNEO";

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
              {isTournamentAdmin ? "MIS TORNEOS" : "TORNEOS"}
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">
              {isTournamentAdmin ? "Ligas y competiciones asignadas a tu cargo" : "Administra tus ligas y competiciones"}
            </p>
          </div>

          {/* Botón Crear Torneo: Solo para Superadmin y Admin General */}
          {isGlobalAdmin && (
            <Link
              href="/admin/tournaments/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95"
            >
              <Plus size={16} /> Crear Torneo
            </Link>
          )}
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-8 bg-[#00f0ff]/10 blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl border border-[#0055cc]/30 group-hover:border-[#00f0ff]/40 transition-colors"
                  style={{ background: "rgba(0,34,102,0.5)" }}>
                  <Trophy size={22} className="text-[#00f0ff]/60 group-hover:text-[#00f0ff] transition-all group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor(tournament.status)}`}>
                  {tournament.status}
                </span>
              </div>

              <h2 className="font-black text-xl tracking-wide uppercase text-white group-hover:text-[#00f0ff] transition-colors mb-2 leading-tight">
                {tournament.name}
              </h2>

              <p className="text-white/40 text-xs line-clamp-2 mb-6 flex-1">
                {tournament.description || "Torneo deportivo de alto nivel competitivo."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#00f0ff]/10 text-xs text-white/50">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#00f0ff]/60" />
                  <span className="font-bold text-white">{tournament.tournament_teams?.[0]?.count || 0}</span> Equipos
                </div>
                <div className="flex items-center gap-1 text-[#00f0ff] font-bold tracking-wider uppercase text-[10px] group-hover:translate-x-1 transition-transform">
                  Gestionar <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {tournaments?.filter(t => sportFilter === "ALL" || t.sport === sportFilter).length === 0 && (
          <div className="col-span-full p-12 rounded-2xl border border-dashed border-[#00f0ff]/15 text-center flex flex-col items-center justify-center gap-4"
            style={{ background: "rgba(0,17,51,0.4)" }}>
            <Trophy size={32} className="text-[#00f0ff]/30" />
            <span className="text-white/40 text-xs uppercase tracking-widest">
              {isTournamentAdmin ? "No tienes torneos asignados para gestionar" : "No hay torneos registrados"}
            </span>
            {isGlobalAdmin && (
              <Link href="/admin/tournaments/new" className="btn-premium-teal !py-2.5 !px-6">
                Crear el primer torneo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
