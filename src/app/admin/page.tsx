"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Shield } from "@/components/ui/Shield";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Edit3,
  UserPlus,
  ShieldCheck,
  FolderTree,
  LayoutGrid,
  FileText
} from "lucide-react";
import { 
  getCurrentUserProfile, 
  getRoleHierarchyDataAction,
  type UserProfileWithMemberships 
} from "./pegasight-actions";
import { RoleHierarchyAccordion } from "@/components/admin/RoleHierarchyAccordion";

function statusColor(status: string) {
  if (status?.includes("CURSO"))  return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (status?.includes("INSCRI")) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
  if (status?.includes("FINALIZ")) return "text-white/30 border-white/10 bg-white/5";
  return "text-amber-400 border-amber-500/40 bg-amber-500/10";
}

function getMatchResult(m: any) {
  if (!m?.match_results) return null;
  if (Array.isArray(m.match_results)) {
    return m.match_results.length > 0 ? m.match_results[0] : null;
  }
  return m.match_results;
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState<UserProfileWithMemberships | null>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"hierarchy" | "grid">("hierarchy");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile);

      // Cargar datos jerárquicos adaptados al rol
      try {
        const hData = await getRoleHierarchyDataAction();
        setHierarchyData(hData);
      } catch (hErr) {
        console.error("Error al cargar jerarquía:", hErr);
      }

      const supabase = createClient();

      if (userProfile?.role === "USUARIO_DE_RESULTADOS") {
        const tourneyIds = userProfile.memberships.map((m: any) => m.tournament_id);
        if (tourneyIds.length > 0) {
          const { data: matchesData } = await supabase
            .from("matches")
            .select(`
              id,
              match_date,
              match_time,
              status,
              home_team:home_team_id(name),
              away_team:away_team_id(name),
              tournament:tournament_id(name),
              match_results(id, status, home_score, away_score, rejection_reason)
            `)
            .in("tournament_id", tourneyIds)
            .order("match_date", { ascending: true })
            .limit(12);
          setMyMatches(matchesData || []);
        }
      } else if (userProfile?.role === "ADMINISTRADOR_DEL_TORNEO") {
        const adminTourneyIds = userProfile.memberships
          .filter((m: any) => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE")
          .map((m: any) => m.tournament_id);

        if (adminTourneyIds.length > 0) {
          const { data } = await supabase
            .from("tournaments")
            .select("*, tournament_teams(count), matches(count)")
            .in("id", adminTourneyIds)
            .order("created_at", { ascending: false });
          setTournaments(data || []);

          const { count } = await supabase
            .from("match_results")
            .select("id", { count: "exact", head: true })
            .in("tournament_id", adminTourneyIds)
            .eq("status", "PENDING_REVIEW");
          setPendingCount(count || 0);
        } else {
          setTournaments([]);
        }
      } else {
        // ADMINISTRADOR_GENERAL y SUPERADMINISTRADOR (Gestión completa de torneos y resultados)
        const { data } = await supabase
          .from("tournaments")
          .select("*, tournament_teams(count), matches(count)")
          .order("created_at", { ascending: false });
        if (data) setTournaments(data);

        const { count } = await supabase
          .from("match_results")
          .select("id", { count: "exact", head: true })
          .eq("status", "PENDING_REVIEW");
        setPendingCount(count || 0);
      }
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Shield className="w-10 h-12 text-[#00f0ff] animate-pulse drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-[#00f0ff]/70 font-mono">Cargando jerarquía del sistema...</span>
        </div>
      </div>
    );
  }

  const role = profile?.role;
  const isGeneralAdmin = role === "ADMINISTRADOR_GENERAL";
  const isSuperadmin = role === "SUPERADMINISTRADOR";
  const isTournamentAdmin = role === "ADMINISTRADOR_DEL_TORNEO";
  const isResultUser = role === "USUARIO_DE_RESULTADOS";

  // Cálculos de métricas
  const totalTeams = tournaments?.reduce((acc: number, t: any) => acc + (t.tournament_teams?.[0]?.count || 0), 0) || 0;
  const totalMatches = tournaments?.reduce((acc: number, t: any) => acc + (t.matches?.[0]?.count || 0), 0) || 0;

  // ─────────────────────────────────────────────────────────────
  // 1. VISTA: USUARIO DE RESULTADOS
  // ─────────────────────────────────────────────────────────────
  if (isResultUser) {
    const pendingSubmission = myMatches.filter((m: any) => {
      const res = getMatchResult(m);
      return !res || res.status === "REJECTED";
    });
    const reviewedSubmission = myMatches.filter((m: any) => {
      const res = getMatchResult(m);
      return res?.status === "PENDING_REVIEW";
    });
    const approvedSubmission = myMatches.filter((m: any) => {
      const res = getMatchResult(m);
      return res?.status === "APPROVED";
    });

    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <header className="pt-4 relative border-b border-white/10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] text-purple-400 uppercase tracking-[0.35em] font-bold font-mono mb-2">
                ⚡ Panel del Anotador
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white hero-title !not-italic leading-none mb-2">
                CAPTURA DE <span className="text-[#00f0ff]">RESULTADOS</span>
              </h1>
              <p className="text-white/40 text-xs uppercase tracking-widest">
                Bienvenido, {profile?.full_name || profile?.email}. Registra marcadores oficiales de tus torneos asignados.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/submit-result"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-purple-500 to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95"
              >
                <Edit3 size={16} /> Registrar Marcador
              </Link>
            </div>
          </div>
        </header>

        {/* Stats del Anotador */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="p-5 md:p-6 rounded-2xl border border-amber-500/20 bg-[#001133]/60 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Por Registrar / Corregir</span>
            </div>
            <span className="text-3xl md:text-4xl font-black text-white">{pendingSubmission.length}</span>
          </div>
          <div className="p-5 md:p-6 rounded-2xl border border-blue-500/20 bg-[#001133]/60 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">En Revisión</span>
            </div>
            <span className="text-3xl md:text-4xl font-black text-white">{reviewedSubmission.length}</span>
          </div>
          <div className="p-5 md:p-6 rounded-2xl border border-emerald-500/20 bg-[#001133]/60 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Aprobados</span>
            </div>
            <span className="text-3xl md:text-4xl font-black text-white">{approvedSubmission.length}</span>
          </div>
        </div>

        {/* Selector de Visualización */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("hierarchy")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === "hierarchy"
                  ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FolderTree size={14} />
              Por Torneo (Desplegable)
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === "grid"
                  ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutGrid size={14} />
              Lista Rápida
            </button>
          </div>
          <Link href="/admin/my-matches" className="text-[10px] text-[#00f0ff] uppercase tracking-wider font-bold hover:underline">
            Ver todos los partidos →
          </Link>
        </div>

        {/* Vista Desplegable */}
        {viewMode === "hierarchy" ? (
          <RoleHierarchyAccordion data={hierarchyData} onRefresh={fetchDashboardData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myMatches.slice(0, 8).map((m: any) => {
              const res = getMatchResult(m);
              const isRejected = res?.status === "REJECTED";
              const isPending = res?.status === "PENDING_REVIEW";
              const isApproved = res?.status === "APPROVED";

              return (
                <div key={m.id} className="p-4 rounded-xl border border-white/10 bg-[#0b1118]/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-white/50">
                    <span>{m.tournament?.name}</span>
                    <span>{m.match_date} {m.match_time || ""}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-white text-sm">
                    <span>{m.home_team?.name}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[#00f0ff]">
                      {res ? `${res.home_score} - ${res.away_score}` : "VS"}
                    </span>
                    <span>{m.away_team?.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      {isRejected && <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30">RECHAZADO: CORREGIR</span>}
                      {isPending && <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">EN REVISIÓN</span>}
                      {isApproved && <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">APROBADO</span>}
                      {!res && <span className="px-2 py-0.5 rounded text-[9px] font-black bg-white/10 text-white/50">SIN RESULTADO</span>}
                    </div>
                    <Link
                      href="/admin/submit-result"
                      className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider hover:underline"
                    >
                      {isRejected ? "Corregir Marcador" : res ? "Ver Detalle" : "Registrar"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. VISTAS: ADMIN GENERAL / SUPERADMIN / ADMIN TORNEO
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Hero Header ── */}
      <header className="pt-4 relative border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#00f0ff]/80 uppercase tracking-[0.35em] font-bold font-mono mb-2">
              ⚡ Control Center
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white hero-title !not-italic leading-none mb-3"
              style={{ textShadow: "0 0 40px rgba(0,240,255,0.2)" }}>
              PANEL DE<br />
              <span className="text-[#00f0ff]">CONTROL</span>
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest">
              {isGeneralAdmin && "Vista Jerárquica Global: Superadministradores ➔ Torneos ➔ Admins y Anotadores"}
              {isSuperadmin && "Gestión de Torneos Supervisados ➔ Administradores y Anotadores"}
              {isTournamentAdmin && "Gestión de Torneos Asignados ➔ Anotadores y Aprobación de Marcadores"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Acciones para Admin General */}
            {isGeneralAdmin && (
              <>
                <Link
                  href="/admin/tournaments/new"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={16} /> Nuevo Torneo
                </Link>
                <Link
                  href="/admin/superadmins"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                >
                  <ShieldCheck size={15} /> Superadmins
                </Link>
                <Link
                  href="/admin/audit-logs"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
                >
                  <FileText size={15} /> Auditoría
                </Link>
              </>
            )}

            {/* Acciones para Superadministrador */}
            {isSuperadmin && (
              <>
                <Link
                  href="/admin/tournaments/new"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95"
                >
                  <Plus size={16} /> Nuevo Torneo
                </Link>
                <Link
                  href="/admin/tournament-admins"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all"
                >
                  <Shield className="w-3.5 h-4" /> Admins Torneo
                </Link>
                <Link
                  href="/admin/result-users"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all"
                >
                  <UserPlus size={15} /> Anotadores
                </Link>
                <Link
                  href="/admin/pending-results"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
                >
                  <Clock size={15} /> Marcadores {pendingCount > 0 && `(${pendingCount})`}
                </Link>
              </>
            )}

            {/* Acciones para Admin de Torneo */}
            {isTournamentAdmin && (
              <>
                <Link
                  href="/admin/pending-results"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all"
                >
                  <Clock size={15} /> Resultados Pendientes {pendingCount > 0 && `(${pendingCount})`}
                </Link>
                <Link
                  href="/admin/result-users"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
                >
                  <UserPlus size={15} /> Usuarios Resultados
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Stats Grid Adaptativa ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {isGeneralAdmin ? [
          { label: "Superadmins", value: hierarchyData?.superadmins?.length || 0, icon: ShieldCheck, color: "#10b981" },
          { label: "Torneos Totales", value: tournaments?.length || 0, icon: Trophy, color: "#00f0ff" },
          { label: "Equipos", value: totalTeams, icon: Users, color: "#0088ff" },
          { label: "Partidos", value: totalMatches, icon: Calendar, color: "#a855f7" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-[#00f0ff]/30 transition-all duration-300" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}>
              <div className="p-5 md:p-6 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} style={{ color: stat.color }} />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">{stat.label}</span>
                </div>
                <span className="text-3xl md:text-5xl font-black text-white hero-title !not-italic transition-all group-hover:text-[#00f0ff]">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        }) : isSuperadmin ? [
          { label: "Torneos Supervisados", value: tournaments?.length || 0, icon: Trophy, color: "#10b981" },
          { label: "Equipos", value: totalTeams, icon: Users, color: "#0088ff" },
          { label: "Partidos", value: totalMatches, icon: Calendar, color: "#00f0ff" },
          { label: "Marcadores Pendientes", value: pendingCount, icon: Clock, color: "#f59e0b" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-400/30 transition-all duration-300" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}>
              <div className="p-5 md:p-6 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} style={{ color: stat.color }} />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">{stat.label}</span>
                </div>
                <span className="text-3xl md:text-5xl font-black text-white hero-title !not-italic transition-all group-hover:text-emerald-400">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        }) : [
          { label: "Mis Torneos", value: tournaments?.length || 0, icon: Trophy, color: "#f59e0b" },
          { label: "Equipos", value: totalTeams, icon: Users, color: "#0088ff" },
          { label: "Partidos", value: totalMatches, icon: Calendar, color: "#00f0ff" },
          { label: "Por Aprobar", value: pendingCount, icon: Clock, color: "#ef4444" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all duration-300" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}>
              <div className="p-5 md:p-6 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} style={{ color: stat.color }} />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">{stat.label}</span>
                </div>
                <span className="text-3xl md:text-5xl font-black text-white hero-title !not-italic transition-all group-hover:text-amber-400">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Switcher de Vista y Filtros ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("hierarchy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === "hierarchy"
                ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FolderTree size={15} />
            Estructura Jerárquica Desplegable
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === "grid"
                ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutGrid size={15} />
            Vista Cuadrícula
          </button>
        </div>

        {viewMode === "grid" && (
          <div className="flex items-center gap-2">
            <button onClick={() => setSportFilter("ALL")} className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sportFilter === "ALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Todos</button>
            <button onClick={() => setSportFilter("FOOTBALL")} className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sportFilter === "FOOTBALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Fútbol</button>
            <button onClick={() => setSportFilter("VOLLEYBALL")} className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sportFilter === "VOLLEYBALL" ? "bg-[#00f0ff] text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>Voleibol</button>
          </div>
        )}
      </div>

      {/* ── Contenido Principal ── */}
      {viewMode === "hierarchy" ? (
        <RoleHierarchyAccordion data={hierarchyData} onRefresh={fetchDashboardData} />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {isTournamentAdmin ? "Tus Torneos Asignados" : "Torneos Registrados"}
            </h2>
            <Link
              href="/admin/tournaments"
              className="text-[10px] text-[#00f0ff]/70 uppercase tracking-widest hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-bold"
            >
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {tournaments?.filter(t => sportFilter === "ALL" || t.sport === sportFilter).map((tournament: any) => (
              <Link
                key={tournament.id}
                href={`/admin/tournaments/${tournament.id}`}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 p-5 rounded-2xl border border-[#00f0ff]/10 hover:border-[#00f0ff]/25 transition-all duration-300 overflow-hidden cursor-pointer"
                style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(12px)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="shrink-0 w-10 h-10 rounded-xl border border-[#0055cc]/30 flex items-center justify-center group-hover:border-[#00f0ff]/40 transition-colors"
                    style={{ background: "rgba(0,34,102,0.5)" }}>
                    <Shield className="w-5 h-7 text-[#00f0ff]/50 group-hover:text-[#00f0ff] transition-colors" />
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
                <span className="text-white/40 text-xs uppercase tracking-widest">
                  {isTournamentAdmin ? "No tienes torneos asignados actualmente" : "No hay torneos registrados"}
                </span>
                {(isGeneralAdmin || isSuperadmin) && (
                  <Link href="/admin/tournaments/new" className="btn-premium-teal !py-2.5 !px-6">
                    Crear el primer torneo
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
