"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldCheck, Trophy, PenLine, Loader2 } from "lucide-react";
import SuperadminsManager from "@/components/admin/SuperadminsManager";
import TournamentAdminsManager from "@/components/admin/TournamentAdminsManager";
import ResultUsersManager from "@/components/admin/ResultUsersManager";
import { getCurrentUserProfile, PlatformRole } from "@/app/admin/pegasight-actions";

export default function UnifiedUsersPage() {
  const [role, setRole] = useState<PlatformRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRole() {
      try {
        const profile = await getCurrentUserProfile();
        if (profile) setRole(profile.role);
      } catch (err) {
        console.error("Error loading user role", err);
      } finally {
        setLoading(false);
      }
    }
    loadRole();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
      </div>
    );
  }

  // Determine default tab based on role
  let defaultTab = "anotadores";
  if (role === "ADMINISTRADOR_GENERAL") defaultTab = "superadmins";
  else if (role === "SUPERADMINISTRADOR") defaultTab = "admins-torneo";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-8 h-8 text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-white font-sans">
              Gestión de Usuarios
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 tracking-wide">
            Administra a tu equipo, permisos y accesos desde un solo lugar.
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="flex flex-col sm:flex-row w-full h-auto bg-transparent p-0 mb-8 gap-3">
          {role === "ADMINISTRADOR_GENERAL" && (
            <TabsTrigger 
              value="superadmins" 
              className="flex-1 w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-extrabold uppercase tracking-widest text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-emerald-400/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <ShieldCheck size={18} />
              Superadmins
            </TabsTrigger>
          )}

          {(role === "ADMINISTRADOR_GENERAL" || role === "SUPERADMINISTRADOR") && (
            <TabsTrigger 
              value="admins-torneo" 
              className="flex-1 w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] font-extrabold uppercase tracking-widest text-amber-400/60 hover:bg-amber-500/10 hover:text-amber-300 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-amber-400/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 data-[state=active]:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <Trophy size={18} />
              Admins Torneo
            </TabsTrigger>
          )}

          <TabsTrigger 
            value="anotadores" 
            className="flex-1 w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[11px] font-extrabold uppercase tracking-widest text-purple-400/60 hover:bg-purple-500/10 hover:text-purple-300 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-purple-400/10 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/30 data-[state=active]:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <PenLine size={18} />
            Anotadores
          </TabsTrigger>
        </TabsList>

        {role === "ADMINISTRADOR_GENERAL" && (
          <TabsContent value="superadmins" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SuperadminsManager />
          </TabsContent>
        )}

        {(role === "ADMINISTRADOR_GENERAL" || role === "SUPERADMINISTRADOR") && (
          <TabsContent value="admins-torneo" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TournamentAdminsManager />
          </TabsContent>
        )}

        <TabsContent value="anotadores" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ResultUsersManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
