"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Shield } from "@/components/ui/Shield";
import { TournamentForm } from "@/components/admin/TournamentForm";
import { getCurrentUserProfile, type UserProfileWithMemberships } from "@/app/admin/pegasight-actions";

export default function NewTournamentPage() {
  const [profile, setProfile] = useState<UserProfileWithMemberships | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="p-8 md:p-12 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Shield className="w-10 h-12 text-[#00f0ff] animate-pulse" />
      </div>
    );
  }

  const isAuthorized = profile?.role === "ADMINISTRADOR_GENERAL" || profile?.role === "SUPERADMINISTRADOR";

  if (!isAuthorized) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto pt-16">
        <div className="bg-[#0b1118]/90 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-3">
            Creación de Torneos Restringida
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto leading-relaxed mb-8">
            La creación de nuevos torneos en la plataforma está reservada exclusivamente a los <span className="text-[#00f0ff] font-bold">Superadministradores</span> y al <span className="text-[#00f0ff] font-bold">Administrador General</span>. Como Administrador de Torneo, tu función es gestionar las ligas asignadas a tu cargo.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/admin/tournaments"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs tracking-wider uppercase transition-all"
            >
              Volver a Mis Torneos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto relative">
      {/* Back button */}
      <Link href="/admin/tournaments" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={16} /> Volver a Torneos
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tighter text-white hero-title !not-italic mb-2 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          NUEVO TORNEO
        </h1>
        <p className="text-[#00f0ff]/60 text-xs font-semibold uppercase tracking-widest">
          Configuración inicial de la liga
        </p>
      </header>

      <TournamentForm />
    </div>
  );
}
