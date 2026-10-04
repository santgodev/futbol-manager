"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Shield, Plus, Users, ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getCurrentUserProfile, type UserProfileWithMemberships } from "../pegasight-actions";

export default function AdminTeamsPage() {
  const [profile, setProfile] = useState<UserProfileWithMemberships | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);

        if (userProfile?.role === "USUARIO_DE_RESULTADOS") {
          return;
        }

        const supabase = createClient();
        const { data } = await supabase
          .from("teams")
          .select(`
            *, 
            players(count)
          `)
          .order("name", { ascending: true });
        if (data) setTeams(data);
      } catch (err) {
        console.error("Error cargando equipos:", err);
      } finally {
        setLoading(false);
      }
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

  // Si es Usuario de Resultados, restringir acceso
  if (profile?.role === "USUARIO_DE_RESULTADOS") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Gestión de Equipos Restringida
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            La creación y administración de plantillas de equipos está reservada a los administradores. Tu rol de <span className="text-purple-400 font-bold">Usuario de Resultados</span> te permite capturar los marcadores en los partidos correspondientes.
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

  const canRegisterTeam = profile?.role === "ADMINISTRADOR_GENERAL" || profile?.role === "SUPERADMINISTRADOR" || profile?.role === "ADMINISTRADOR_DEL_TORNEO";

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
              Directorio de equipos registrados
            </p>
          </div>

          {canRegisterTeam && (
            <Link
              href="/admin/teams/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95"
            >
              <Plus size={16} /> Registrar Equipo
            </Link>
          )}
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
                <div className="w-16 h-16 mb-4 rounded-full border border-[#0055cc]/40 flex items-center justify-center relative z-10 transition-colors group-hover:border-[#00f0ff]/60"
                  style={{ background: "rgba(0,34,102,0.5)" }}>
                  <Shield size={28} className="text-[#00f0ff]/60 group-hover:text-[#00f0ff] transition-colors" />
                </div>
              )}

              {/* Info */}
              <span className="font-bold text-sm text-center text-white group-hover:text-[#00f0ff] transition-colors line-clamp-1 mb-1 relative z-10">
                {team.name}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest relative z-10">
                {playersCount} {playersCount === 1 ? "Jugador" : "Jugadores"}
              </span>
            </Link>
          );
        })}

        {teams?.length === 0 && (
          <div className="col-span-full p-12 text-center text-white/40 text-xs uppercase tracking-widest border border-dashed border-[#00f0ff]/15 rounded-2xl">
            No hay equipos registrados actualmente.
          </div>
        )}
      </div>

    </div>
  );
}
