"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft, ExternalLink, Users, Calendar, BarChart2, Trophy, AlertTriangle, Tag, Layers, CheckCircle2, Sparkles } from "lucide-react";
import { TournamentGroupManager } from "@/components/admin/TournamentTeamManager";
import { TournamentEnrollmentManager } from "@/components/admin/TournamentEnrollmentManager";
import { MatchEditor } from "@/components/admin/MatchEditor";
import { TournamentStatusSwitcher } from "@/components/admin/TournamentStatusSwitcher";
import { MatchCreator } from "@/components/admin/MatchCreator";
import { TournamentStandings } from "@/components/admin/TournamentStandings";
import { TournamentTopScorers } from "@/components/admin/TournamentTopScorers";
import { TournamentBracket } from "@/components/admin/TournamentBracket";
import { BracketGenerator } from "@/components/admin/BracketGenerator";
import { FixtureGenerator } from "@/components/admin/FixtureGenerator";
import { CompetitionEngine } from "@/utils/CompetitionEngine";
import { CollapsibleEliminatoriaSection } from "@/components/admin/CollapsibleEliminatoriaSection";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { TournamentAdminManager } from "@/components/admin/TournamentAdminManager";
import { TournamentResultUserManager } from "@/components/admin/TournamentResultUserManager";
import { getCurrentUserProfile } from "@/app/admin/pegasight-actions";
import { assignOrphanItemsToCategory, removeOrphanItemsFromTournament } from "@/app/admin/actions";

export function TournamentDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinishedMatches, setShowFinishedMatches] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number | "ALL">("ALL");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [assigningOrphans, setAssigningOrphans] = useState(false);
  const [showManualMatchCreator, setShowManualMatchCreator] = useState(false);

  const fetchAllData = async () => {
    if (!id) return;
    let profile: any = null;
    try {
      profile = await getCurrentUserProfile();
      setCurrentUser(profile);
      if (profile?.role === "USUARIO_DE_RESULTADOS") {
        router.push("/admin/my-matches");
        return;
      }
    } catch (e) {
      console.error(e);
    }
    const supabase = createClient();
    
    // 1. Tournament
    const { data: tData } = await supabase
      .from("tournaments")
      .select("*, tournament_teams(*, team:teams(name, logo_url))")
      .eq("id", id)
      .single();
      
    if (!tData) {
      router.push("/admin/tournaments");
      return;
    }

    // Validar aislamiento: Un Admin de Torneo solo puede abrir torneos asignados a él
    if (profile?.role === "ADMINISTRADOR_DEL_TORNEO") {
      const isAssigned = (profile.memberships || []).some(
        (m: any) => m.tournament_id === id && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
      );
      if (!isAssigned) {
        router.push("/admin/tournaments");
        return;
      }
    }

    setTournament(tData);

    // 2. Available Teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", id)
      .order("name");
    if (teamsData) setAvailableTeams(teamsData);

    // 3. Matches
    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url),
        match_sets (
          id, set_number, home_points, away_points, status, winner_team_id
        ),
        match_logs (
          id, old_home_score, new_home_score, old_away_score, new_away_score, created_at, changed_by
        )
      `)
      .eq("tournament_id", id)
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true });
    if (matchesData) setMatches(matchesData);

    // 4. Standings
    const { data: standingsData } = await supabase
      .from("tournament_standings_view")
      .select("*")
      .eq("tournament_id", id)
      .order("points", { ascending: false })
      .order("goal_difference", { ascending: false })
      .order("goals_for", { ascending: false });
    if (standingsData) setStandings(standingsData);

    // 5. Top Scorers
    const { data: scorersData } = await supabase
      .from("tournament_top_scorers_view")
      .select("*")
      .eq("tournament_id", id)
      .order("goals", { ascending: false });
    if (scorersData && scorersData.length > 0) {
      setTopScorers(scorersData);
    } else {
      const { data: approvedResults } = await supabase
        .from("match_results")
        .select("sets_data, match:match_id(home_team_id, away_team_id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name))")
        .eq("tournament_id", id)
        .eq("status", "APPROVED");

      const fallbackMap = new Map<string, any>();
      for (const r of approvedResults || []) {
        if (!r.sets_data) continue;
        try {
          const evs = typeof r.sets_data === "string" ? JSON.parse(r.sets_data) : r.sets_data;
          if (!Array.isArray(evs)) continue;
          const mInfo: any = Array.isArray(r.match) ? r.match[0] : r.match;
          for (const ev of evs) {
            if (ev.type === "GOAL") {
              const pId = ev.player_id || ev.player?.name || "anon";
              const pName = ev.player?.name || ev.description || "Jugador";
              const tName =
                ev.team_id === mInfo?.home_team_id
                  ? mInfo?.home_team?.name
                  : ev.team_id === mInfo?.away_team_id
                  ? mInfo?.away_team?.name
                  : "";
              const cur = fallbackMap.get(pId) || {
                player_id: pId,
                player_name: pName,
                team_id: ev.team_id,
                team_name: tName || "Equipo",
                goals: 0,
                number: ev.player?.number || null,
                photo_url: null,
              };
              cur.goals += 1;
              fallbackMap.set(pId, cur);
            }
          }
        } catch {
          // ignore malformed JSON
        }
      }
      setTopScorers(Array.from(fallbackMap.values()).sort((a, b) => b.goals - a.goals));
    }

    // 6. Categories
    const { data: categoriesData } = await supabase
      .from("tournament_categories")
      .select("*")
      .eq("tournament_id", id)
      .order("display_order", { ascending: true });
    if (categoriesData) {
      setCategories(categoriesData);
      // Auto-select first category if none is selected or if previous was deleted
      if (categoriesData.length > 0) {
        setActiveCategoryId(prev => {
          if (prev && categoriesData.some((c: any) => c.id === prev)) return prev;
          return categoriesData[0].id;
        });
      } else {
        setActiveCategoryId(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <Shield className="w-12 h-16 text-brand-teal animate-pulse drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
      </div>
    );
  }

  if (!tournament) return null;

  // ── FILTER BY ACTIVE CATEGORY ──
  const activeCategory = categories.find((c: any) => c.id === activeCategoryId) || null;
  const activeCategoryName = activeCategory
    ? activeCategory.name
    : categories.length === 0
    ? (tournament.category || "Categoría Única / General")
    : "General";

  const orphanTeamsCount = categories.length > 0
    ? (tournament.tournament_teams?.filter((tt: any) => !tt.category_id).length || 0)
    : 0;
  const orphanMatchesCount = categories.length > 0
    ? (matches.filter((m: any) => !m.category_id).length || 0)
    : 0;

  const handleAssignOrphans = async () => {
    if (!activeCategoryId) return;
    setAssigningOrphans(true);
    try {
      await assignOrphanItemsToCategory(id, activeCategoryId);
      await fetchAllData();
    } catch (err: any) {
      alert("Error vinculando elementos a la categoría: " + err.message);
    } finally {
      setAssigningOrphans(false);
    }
  };

  const handleCleanOrphans = async () => {
    setAssigningOrphans(true);
    try {
      await removeOrphanItemsFromTournament(id);
      await fetchAllData();
    } catch (err: any) {
      alert("Error limpiando elementos sin categoría: " + err.message);
    } finally {
      setAssigningOrphans(false);
    }
  };

  const activeTeams = activeCategoryId
    ? tournament.tournament_teams?.filter((tt: any) => tt.category_id === activeCategoryId) || []
    : tournament.tournament_teams || [];

  const activeMatches = activeCategoryId
    ? matches.filter((m: any) => m.category_id === activeCategoryId)
    : matches;

  // Compute standings exclusively from FINISHED non-knockout matches of this category
  // so Semifinals/Finals (Copa Oro / Copa Plata) never pollute group stage PJ, DG, or PTS.
  const activeStandings = CompetitionEngine.calculateGroupStandings(
    activeTeams,
    activeMatches,
    tournament.sport || "FOOTBALL",
    standings
  );

  const activeScorers = activeCategoryId
    ? topScorers.filter((s: any) => activeTeams.some((tt: any) => tt.team_id === s.team_id))
    : topScorers;

  const activeGroupsCount = new Set(
    activeTeams.map((tt: any) => tt.group_name).filter(Boolean)
  ).size;

  // Use the filtered activeTeams/activeMatches for Analysis
  const categoryTournament = { ...tournament, tournament_teams: activeTeams };
  const analysis = CompetitionEngine.analyzeTournament(categoryTournament, activeMatches);
  const {
    format,
    isDoubleRound,
    state,
    integrity,
    teamsCount,
    matchesPlayed,
    groupMatchesCount,
    groupMatchesPlayed,
    groupMatchesPending,
    requiredGroupMatches,
    isGroupStageComplete,
    knockoutMatchesCount,
    theoreticalTotalMatches
  } = analysis;

  const {
    severity: integritySeverity,
    label: integrityLabel,
    description: integrityDesc,
    color: integrityColor,
    dotColor: integrityDot,
    hasCalendarInconsistency,
    hasCriticalInconsistency,
    teamsWithNoMatches,
    problematicMatchIds = []
  } = integrity;

  // For visual filtering UI only
  const groupMatches = activeMatches?.filter((m: any) => !m.is_knockout) || [];
  const uniqueRounds = Array.from(
    new Set(groupMatches.map((m: any) => m.round_number).filter(Boolean))
  ).sort((a: any, b: any) => a - b);

  const filteredMatches = (selectedRound === "ALL" || uniqueRounds.length === 0)
    ? activeMatches
    : activeMatches.filter((m: any) => m.is_knockout || m.round_number === selectedRound);

  const getStatusLabel = (status: string) => {
    if (status === "DRAFT") return "PRÓXIMAMENTE";
    if (status === "REGISTRATION") return "INSCRIPCIONES";
    if (status === "IN_PROGRESS") return "EN CURSO";
    if (status === "FINISHED") return "FINALIZADO";
    if (status === "DISABLED") return "DESHABILITADO";
    return status;
  };

  const statusColor = (status: string) => {
    const s = getStatusLabel(status);
    if (s.includes("CURSO"))    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    if (s.includes("INSCRI"))   return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    if (s.includes("FINALIZ"))  return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    if (s.includes("DESHABI"))  return "bg-red-500/20 text-red-500 border-red-500/40";
    return "bg-amber-500/20 text-amber-400 border-amber-500/40"; // Próximamente
  };

  const getSportLabel = (sport: string) => {
    if (!sport) return "FÚTBOL";
    if (sport === "FOOTBALL") return "FÚTBOL";
    if (sport === "BASKETBALL") return "BALONCESTO";
    if (sport === "VOLLEYBALL") return "VOLEIBOL";
    if (sport === "BEACH_VOLLEYBALL") return "VOLEIBOL PLAYA";
    if (sport === "FUTBOL_7") return "FÚTBOL 7";
    if (sport === "FUTBOL_11") return "FÚTBOL 11";
    if (sport === "FUTBOL_5") return "FÚTBOL SALA";
    return sport.replace(/_/g, " ");
  };

  const isVolleyballTournament = tournament?.sport === "VOLLEYBALL" || tournament?.sport === "BEACH_VOLLEYBALL";
  const sportLabel = getSportLabel(tournament.sport);
  const sportIcon = isVolleyballTournament ? "🏐" : "⚽";

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto">

      {/* ── Back ── */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={14} /> Volver al Dashboard
      </Link>

      {/* ── HEADER ── */}
      <header className="mb-8 relative rounded-2xl overflow-hidden border border-[#00f0ff]/15 shadow-[0_0_60px_rgba(0,136,255,0.08)]" style={{ background: "rgba(0,17,51,0.7)", backdropFilter: "blur(20px)" }}>
        {/* Top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent" />
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0066cc]/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00f0ff]/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start gap-6 p-6 md:p-8 relative z-10">
          {/* Logo */}
          <div className="shrink-0 w-20 h-20 rounded-xl border border-[#00f0ff]/20 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)]" style={{ background: "rgba(0,34,102,0.5)" }}>
            {tournament.image_url ? (
              <Image src={tournament.image_url} alt={tournament.name} width={80} height={80} className="object-contain p-1" unoptimized />
            ) : (
              <Trophy size={32} className="text-[#00f0ff]/50" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
               <span className="text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{sportIcon}</span>
               <span className="text-[#00f0ff] font-black tracking-[0.2em] uppercase text-[10px] md:text-xs text-shadow-glow">
                 Torneo de {sportLabel}
               </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white hero-title !not-italic truncate" style={{ textShadow: "0 0 20px rgba(0,240,255,0.3)" }}>
                {tournament.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">

              <span className={`text-[9px] font-bold flex items-center uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor(tournament.status)}`}>
                {getStatusLabel(tournament.status)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff]">
                {CompetitionEngine.getFormatLabel(format, isDoubleRound)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                {CompetitionEngine.getStateLabel(state)}
              </span>
              {categories.length > 0 ? (
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#0055cc]/40 bg-[#0055cc]/10 text-[#00f0ff]">
                  {categories.length === 1
                    ? `Categoría: ${categories[0].name}`
                    : `${categories.length} Categorías (${categories.map((c: any) => c.name).join(" • ")})`}
                </span>
              ) : tournament.category ? (
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#0055cc]/40 bg-[#0055cc]/10 text-[#00f0ff]/80">
                  {tournament.category}
                </span>
              ) : null}
            </div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4">📍 {tournament.location}</p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-[#00f0ff]/70" />
                <span className="text-white font-bold text-sm">{teamsCount}</span>
                <span className="text-white/40 text-xs">
                  equipos {categories.length > 0 && activeCategory ? `(${activeCategory.name})` : "inscritos"}
                </span>
              </div>
              <div className="w-px h-4 bg-white/10 self-center" />
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-[#00f0ff]/70" />
                <span className="text-white font-bold text-sm">{matchesPlayed}</span>
                <span className="text-white/40 text-xs">
                  / {theoreticalTotalMatches} partidos {categories.length > 0 && activeCategory ? `(${activeCategory.name})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 shrink-0">
            <TournamentStatusSwitcher tournament={tournament} isDisabled={integritySeverity === "CRITICAL"} onUpdate={fetchAllData} isSuperAdmin={currentUser?.role === "SUPERADMINISTRADOR" || currentUser?.role === "ADMINISTRADOR_GENERAL"} />
            <Link
              href={`/t/${tournament.slug}`}
              target="_blank"
              className="flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#0055cc] to-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <ExternalLink size={14} /> Ver en Vivo
            </Link>
          </div>
        </div>
      </header>

      {/* ── CONFIGURACIÓN GLOBAL DEL TORNEO (Personal y Categorías) ── */}
      <div className="grid grid-cols-1 gap-8 mb-10">

        {/* ── SECCIÓN ADMINISTRADORES: Asignación y Gestión de Administradores (Solo Superadmin y Admin General) ── */}
        {(currentUser?.role === "ADMINISTRADOR_GENERAL" || currentUser?.role === "SUPERADMINISTRADOR") && (
          <section className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/10" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
              <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
                <Shield size={14} className="text-[#00f0ff]" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Administradores del Torneo</h2>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-white/40">Configuración Global</span>
            </div>
            <div className="p-6">
              <TournamentAdminManager tournamentId={id} />
            </div>
          </section>
        )}

        {/* ── SECCIÓN ANOTADORES: Asignación y Gestión de Usuarios de Resultados (Admin General, Superadmin y Admin del Torneo) ── */}
        {(currentUser?.role === "ADMINISTRADOR_GENERAL" || currentUser?.role === "SUPERADMINISTRADOR" || currentUser?.role === "ADMINISTRADOR_DEL_TORNEO") && (
          <section className="relative rounded-2xl overflow-hidden border border-purple-500/20" style={{ background: "rgba(15,10,30,0.6)", backdropFilter: "blur(16px)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <div className="flex items-center gap-3 px-6 py-4 border-b border-purple-500/20">
              <div className="p-1.5 rounded-lg border border-purple-500/30" style={{ background: "rgba(88,28,135,0.3)" }}>
                <Users size={14} className="text-purple-400" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Anotadores del Torneo</h2>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-purple-300/40">Configuración Global</span>
            </div>
            <div className="p-6">
              <TournamentResultUserManager tournamentId={id} />
            </div>
          </section>
        )}

        {/* ── SECCIÓN 0: Gestión de Categorías ── */}
        <section id="seccion-categorias" className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/10 scroll-mt-6" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
            <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
              <Tag size={14} className="text-[#00f0ff]" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Categorías del Torneo</h2>
              <p className="text-[10px] text-white/40 mt-0.5">
                Crea las categorías aquí y luego selecciona una abajo para organizar sus equipos, grupos, calendario y llaves.
              </p>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#00f0ff]/20 bg-[#00f0ff]/10 text-[#00f0ff]">
              {categories.length} {categories.length === 1 ? 'Categoría' : 'Categorías'}
            </span>
          </div>
          <div className="p-6">
            <CategoryManager
              tournamentId={id}
              categories={categories}
              enrolledTeams={tournament.tournament_teams || []}
              availableTeams={availableTeams}
              activeCategoryId={activeCategoryId}
              onSelectCategory={(catId) => {
                setActiveCategoryId(catId);
                setSelectedRound("ALL");
              }}
              onUpdate={fetchAllData}
              isDisabled={integritySeverity === "CRITICAL"}
            />
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BARRA FIJA / DESTACADA DE PESTAÑAS DE CATEGORÍA
          Justo encima de toda la organización deportiva:
          (Equipos → Grupos → Calendario → Partidos → Eliminatorias → Tabla)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div
        id="zona-organizacion-categoria"
        className="sticky top-2 z-30 mb-8 rounded-2xl border-2 border-[#00f0ff]/40 bg-[#020a18]/95 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(0,240,255,0.18)] overflow-hidden transition-all"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#0055cc] via-[#00f0ff] to-[#0055cc]" />

        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Fila 1: Título de la Categoría Activa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                <Layers size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#00f0ff]/70 block">
                  Zona de Organización Deportiva
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-lg font-black uppercase tracking-wider text-white">
                    Organizando: <span className="text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">Categoría {activeCategoryName}</span>
                  </span>
                  {activeCategory && (
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-white/70">
                      {activeCategory.gender === "M" ? "Masculino" : activeCategory.gender === "F" ? "Femenino" : "Mixto"}
                      {(activeCategory.min_age || activeCategory.max_age) ? ` • ${activeCategory.min_age ?? 0}–${activeCategory.max_age ?? "∞"} años` : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("seccion-categorias")?.scrollIntoView({ behavior: "smooth" })}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all shrink-0"
            >
              + Crear / Editar Categorías
            </button>
          </div>

          {/* Fila 2: Pestañas de Categoría (si el torneo tiene categorías) */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1 border-t border-white/10">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mr-1 shrink-0">
                Cambiar categoría:
              </span>
              {categories.map((cat: any) => {
                const isSelected = activeCategoryId === cat.id;
                const catTeamsCount = tournament.tournament_teams?.filter((tt: any) => tt.category_id === cat.id).length || 0;
                const catMatchesCount = matches.filter((m: any) => m.category_id === cat.id).length || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategoryId(cat.id);
                      setSelectedRound("ALL");
                    }}
                    className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-gradient-to-r from-[#00f0ff] to-[#00b8ff] text-[#000d1a] border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-[1.02]"
                        : "bg-[#001122]/80 text-white/70 border-white/10 hover:border-[#00f0ff]/40 hover:text-white hover:bg-[#001a33]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-black/25 text-[#000d1a] font-black"
                          : "bg-white/5 text-[#00f0ff]/80"
                      }`}
                    >
                      {catTeamsCount} eq. • {catMatchesCount} part.
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Aviso si existen equipos o partidos huérfanos sin categoría */}
          {categories.length > 0 && activeCategory && (orphanTeamsCount > 0 || orphanMatchesCount > 0) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                <span>
                  Hay <strong>{orphanTeamsCount} equipo(s)</strong> y <strong>{orphanMatchesCount} partido(s)</strong> residuales sin categoría asignada.
                  {matchesPlayed > 0 && ` (${activeCategory.name} ya tiene partidos jugados, por lo que no deben mezclarse).`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {matchesPlayed === 0 && (
                  <button
                    type="button"
                    disabled={assigningOrphans}
                    onClick={handleAssignOrphans}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider hover:bg-amber-300 transition-all"
                  >
                    {assigningOrphans ? "Procesando..." : `Mover a ${activeCategory.name}`}
                  </button>
                )}
                <button
                  type="button"
                  disabled={assigningOrphans}
                  onClick={handleCleanOrphans}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-black text-[10px] uppercase tracking-wider hover:bg-red-500/30 transition-all"
                >
                  {assigningOrphans ? "Limpiando..." : "Limpiar registros sin categoría"}
                </button>
              </div>
            </div>
          )}

          {/* Fila 3: Navegador Paso a Paso de la Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-2 border-t border-white/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#00f0ff]/50 mr-1 shrink-0">
              Pasos ({activeCategoryName}):
            </span>
            {[
              { id: "seccion-equipos", label: "1. Equipos", badge: `${teamsCount}`, done: teamsCount >= 2 },
              { id: "seccion-grupos", label: "2. Grupos", badge: `${activeGroupsCount}`, done: activeGroupsCount > 0 },
              ...(format !== "PLAYOFFS"
                ? [{ id: "seccion-calendario", label: "3. Calendario", badge: `${groupMatchesCount}`, done: groupMatchesCount > 0 }]
                : []),
              { id: "gestor-partidos", label: "4. Partidos", badge: `${matchesPlayed}/${activeMatches.length}`, done: matchesPlayed > 0 && matchesPlayed === activeMatches.length },
              ...(format !== "LEAGUE"
                ? [{ id: "seccion-eliminatorias", label: "5. Eliminatorias", badge: `${knockoutMatchesCount}`, done: knockoutMatchesCount > 0 }]
                : []),
              { id: "seccion-posiciones", label: "6. Tabla y Goleadores", badge: "", done: matchesPlayed > 0 },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => document.getElementById(step.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0 cursor-pointer ${
                  step.done
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {step.done && <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />}
                <span>{step.label}</span>
                {step.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-[#00f0ff]">
                    {step.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ESTADO DE INTEGRIDAD DE LA CATEGORÍA ACTIVA ── */}
      <div className={`mb-8 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md transition-all ${integrityColor}`}>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${integrityDot}`} />
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-white/50 block">
              Estado del calendario • Categoría {activeCategoryName}
            </span>
            <span className="text-sm font-black uppercase tracking-wider block">{integrityLabel}</span>
          </div>
        </div>
        <div className="flex-1 max-w-xl md:border-l md:border-white/10 md:pl-4 flex flex-col items-start gap-2">
          <p className="text-xs text-white/70 leading-relaxed">
            {integrityDesc}
          </p>
          {integritySeverity === "CRITICAL" && (
            <button
              onClick={() => {
                document.getElementById('gestor-partidos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
            >
              Ver partidos a corregir
            </button>
          )}
        </div>
      </div>

      {/* ── SECCIONES DE ORGANIZACIÓN DEPORTIVA DE LA CATEGORÍA ACTIVA ── */}
      <div className="grid grid-cols-1 gap-8">

        {/* ── SECCIÓN 1: Inscripción de Equipos ── */}
        <section id="seccion-equipos" className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/15 scroll-mt-44" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
            <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
              <Users size={14} className="text-[#00f0ff]" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">1. Equipos del Torneo</h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
              Organizando: Categoría {activeCategoryName}
            </span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#00f0ff]/20 bg-[#00f0ff]/10 text-[#00f0ff]">
              {teamsCount} equipos en {activeCategoryName}
            </span>
          </div>
          <div className="p-6">
            <TournamentEnrollmentManager
              tournamentId={id}
              categoryId={activeCategoryId}
              availableTeams={availableTeams || []}
              currentTeams={activeTeams}
              onUpdate={fetchAllData}
              isDisabled={integritySeverity === "CRITICAL"}
              hasPlayedMatches={matchesPlayed > 0}
            />
          </div>
        </section>

        {/* ── SECCIÓN 2: Gestión de Grupos ── */}
        <section id="seccion-grupos" className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/15 scroll-mt-44" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
            <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
              <Trophy size={14} className="text-[#00f0ff]" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">2. Grupos</h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
              Organizando: Categoría {activeCategoryName}
            </span>
          </div>
          <div className="p-6">
            <TournamentGroupManager
              tournamentId={id}
              categoryId={activeCategoryId}
              currentTeams={activeTeams}
              onUpdate={fetchAllData}
              isDisabled={integritySeverity === "CRITICAL"}
            />
          </div>
        </section>

        {/* ── SECCIÓN 3: Programar Partido y Calendario Automático ── */}
        {format !== "PLAYOFFS" && (
          <section id="seccion-calendario" className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/15 scroll-mt-44" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
              <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
                <Calendar size={14} className="text-[#00f0ff]" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">3. Calendario y Agregar Partido</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
                Organizando: Categoría {activeCategoryName}
              </span>
            </div>
            <div className="p-6">
              {integritySeverity === "CRITICAL" ? (
                <div className="py-8 text-center flex flex-col items-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-black uppercase tracking-[0.2em]">Partidos Bloqueados 🔒</span>
                  <p className="text-white/40 text-xs max-w-sm leading-relaxed mx-auto">
                    No puedes agregar partidos mientras haya un problema en el calendario. Corrígelo para continuar.
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    const hasCompleteCalendar =
                      requiredGroupMatches > 0 && groupMatchesCount >= requiredGroupMatches;
                    return (
                      <>
                        <FixtureGenerator
                          tournamentId={id}
                          categoryId={activeCategoryId}
                          teams={activeTeams}
                          hasGroupMatches={activeMatches?.some((m: any) => m.stage === "GROUP" || m.stage === "GRUPOS")}
                          hasPlayedMatches={activeMatches?.some((m: any) => m.status === "FINISHED" || m.status === "IN_PROGRESS" || m.status === "LIVE" || m.home_score !== null || m.away_score !== null)}
                          onUpdate={fetchAllData}
                        />
                        <div className="mt-6 pt-6 border-t border-[#0055cc]/20">
                          {hasCompleteCalendar && !showManualMatchCreator ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <span className="text-xs text-white/50">
                                ¿Necesitas programar un partido amistoso o adicional fuera del sorteo automático?
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowManualMatchCreator(true)}
                                className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                + Agregar partido manual
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              {hasCompleteCalendar && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00f0ff]/70">
                                    Programar partido manual adicional
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowManualMatchCreator(false)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
                                  >
                                    Ocultar formulario
                                  </button>
                                </div>
                              )}
                              <MatchCreator
                                tournamentId={id}
                                categoryId={activeCategoryId}
                                teams={activeTeams}
                                onUpdate={fetchAllData}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </section>
        )}

        {/* ── SECCIÓN 4: Editor de Marcadores / Partidos ── */}
        <section id="gestor-partidos" className="relative rounded-2xl border border-[#00f0ff]/15 w-full max-w-full min-w-0 scroll-mt-44" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#00f0ff]/10">
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
                <BarChart2 size={14} className="text-[#00f0ff]" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">4. Partidos</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
                Organizando: Categoría {activeCategoryName}
              </span>
            </div>
            <div className="sm:ml-auto flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse inline-block" />
                {activeMatches?.filter((m: any) => m.status !== "FINISHED").length ?? 0} pendientes
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shrink-0">
                {matchesPlayed} jugados
              </span>
            </div>
          </div>
          <div className="p-3 pl-14 sm:pl-6 sm:p-6 w-full overflow-hidden">
            {/* ── Warning & Progress stage if matches exist ── */}
            {activeMatches && activeMatches.length > 0 && (
              <>
                {/* ── Warning for teams with 0 matches ── */}
                {teamsWithNoMatches.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3 items-start animate-pulse w-full">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-amber-500 text-xs font-black uppercase tracking-wider mb-1">¡Inconsistencia de Calendario en {activeCategoryName}!</h4>
                      <p className="text-white/70 text-xs leading-relaxed break-words">
                        Hay equipos inscritos en esta categoría que no tienen ningún partido programado en la fase de grupos:{" "}
                        <span className="text-amber-400 font-bold">
                          {teamsWithNoMatches.map((tt: any) => tt.team?.name).join(", ")}
                        </span>
                        . Esto romperá la equidad y la clasificación deportiva. ¡Programa partidos para ellos!
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Group Stage Progress ── */}
                {requiredGroupMatches > 0 && (
                  <div className="mb-6 bg-[#001122]/40 border border-[#0055cc]/20 rounded-xl p-4 relative w-full overflow-hidden shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff]">Avance de Grupos ({activeCategoryName})</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-white/90">
                        {groupMatchesPlayed} / {requiredGroupMatches} <span className="text-white/40">partidos requeridos</span> ({Math.min(100, Math.round((groupMatchesPlayed / requiredGroupMatches) * 100))}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#000d1a] border border-[#0055cc]/30 h-3 rounded-full overflow-hidden p-[2px]">
                      <div 
                        className="bg-gradient-to-r from-brand-teal to-[#00f0ff] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                        style={{ width: `${Math.min(100, Math.round((groupMatchesPlayed / requiredGroupMatches) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {(!activeMatches || activeMatches.length === 0) ? (
              <div className="py-12 text-center flex flex-col items-center gap-3 w-full">
                <Calendar size={32} className="text-[#0055cc]/30" />
                <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
                  No hay partidos programados en {activeCategoryName}
                </span>
                <p className="text-white/25 text-[10px] sm:text-xs max-w-sm mx-auto">
                  Inscribe equipos en esta categoría y usa la sección 3 de arriba para generar el calendario automático o programar el primer partido.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 sm:gap-8 w-full min-w-0">
                {/* ── Round Selector (Jornadas Tabs) ── */}
                {uniqueRounds.length > 0 && (
                  <div className="mb-2 w-full overflow-hidden">
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#00f0ff]/50 block mb-2 font-mono">Jornada ({activeCategoryName})</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar w-full">
                      <button
                        onClick={() => setSelectedRound("ALL")}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all shrink-0 cursor-pointer ${
                          selectedRound === "ALL"
                            ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                            : "bg-[#02060d]/60 border-[#0055cc]/10 text-white/40 hover:border-[#0055cc]/30 hover:text-white"
                        }`}
                      >
                        Ver Todo
                      </button>
                      {uniqueRounds.map((roundNum: any) => (
                        <button
                          key={roundNum}
                          onClick={() => setSelectedRound(roundNum)}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all shrink-0 cursor-pointer ${
                            selectedRound === roundNum
                              ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                              : "bg-[#02060d]/60 border-[#0055cc]/10 text-white/40 hover:border-[#0055cc]/30 hover:text-white"
                          }`}
                        >
                          Jornada {roundNum}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Partidos Pendientes ── */}
                {(() => {
                  const pending = filteredMatches.filter((m: any) => m.status !== "FINISHED");
                  return pending.length > 0 ? (
                    <div className="w-full min-w-0">
                      <div className="flex items-center gap-3 mb-4 w-full">
                        <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse shadow-[0_0_6px_rgba(0,240,255,0.8)] shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal shrink-0">
                          Por jugar
                        </span>
                        <div className="flex-1 h-px bg-brand-teal/10 min-w-0" />
                      </div>
                      <div className="flex flex-col gap-4 w-full min-w-0">
                        {pending.map((match: any) => (
                          <MatchEditor key={match.id} match={match} tournamentId={id} isHighlighted={problematicMatchIds.includes(match.id)} onUpdate={fetchAllData} />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* ── Partidos Jugados ── */}
                {(() => {
                  const finished = filteredMatches.filter((m: any) => m.status === "FINISHED");
                  return finished.length > 0 ? (
                    <div>
                      <button
                        onClick={() => setShowFinishedMatches(!showFinishedMatches)}
                        className="flex items-center gap-3 w-full mb-4 group cursor-pointer text-left focus:outline-none"
                      >
                        <span className={`w-2 h-2 rounded-full bg-white/20 transition-all duration-300 ${showFinishedMatches ? 'bg-brand-teal/80 shadow-[0_0_6px_rgba(0,240,255,0.6)]' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                          Partidos Jugados
                        </span>
                        <div className="flex-1 h-px bg-white/5 group-hover:bg-white/10 transition-colors" />
                        <span className="text-[9px] text-[#00f0ff] group-hover:underline uppercase tracking-widest font-black flex items-center gap-1">
                          {showFinishedMatches ? "Ocultar" : "Mostrar"} ({finished.length} finalizado{finished.length !== 1 ? "s" : ""})
                          <span className={`transform transition-transform duration-300 inline-block text-[7px] ${showFinishedMatches ? 'rotate-180' : ''}`}>▼</span>
                        </span>
                      </button>
                      {showFinishedMatches && (
                        <div className="flex flex-col gap-4 opacity-70 animate-fade-in">
                          {finished.map((match: any) => (
                            <MatchEditor key={match.id} match={match} tournamentId={id} isHighlighted={problematicMatchIds.includes(match.id)} onUpdate={fetchAllData} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </section>

        {/* ── SECCIÓN 5: Fase Eliminatoria ── */}
        {format !== "LEAGUE" && (
          <CollapsibleEliminatoriaSection
            isGroupStageComplete={isGroupStageComplete}
            matches={activeMatches}
            id={id}
            categoryId={activeCategoryId}
            categoryName={activeCategoryName}
            teamsCount={teamsCount}
            groupMatchesPending={groupMatchesPending}
            groupMatchesPlayed={groupMatchesPlayed}
            requiredGroupMatches={requiredGroupMatches}
            onUpdate={fetchAllData}
          />
        )}

        <div id="seccion-posiciones" className="grid grid-cols-1 xl:grid-cols-5 gap-6 scroll-mt-44">
          {/* ── SECCIÓN 6: Tabla de Posiciones ── */}
          {format !== 'PLAYOFFS' && (
            <section className="xl:col-span-3 relative rounded-2xl overflow-hidden border border-[#00f0ff]/15" style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />
              <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
                <div className="p-1.5 rounded-lg border border-[#0055cc]/30" style={{ background: "rgba(0,34,102,0.5)" }}>
                  <Trophy size={14} className="text-[#00f0ff]" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">6. Tabla de Posiciones</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
                  Organizando: Categoría {activeCategoryName}
                </span>
              </div>
              <div className="p-0">
                <TournamentStandings standings={activeStandings || []} tournamentId={id} sport={tournament.sport} />
              </div>
            </section>
          )}

          {/* ── SECCIÓN 7: Top Goleadores ── */}
          <section className={`${format === 'PLAYOFFS' ? 'xl:col-span-5' : 'xl:col-span-2'} relative rounded-2xl overflow-hidden border border-[#00f0ff]/15`} style={{ background: "rgba(0,17,51,0.6)", backdropFilter: "blur(16px)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
            <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#00f0ff]/10">
              <div className="p-1.5 rounded-lg border border-brand-gold/20" style={{ background: "rgba(255,184,0,0.1)" }}>
                <Trophy size={14} className="text-brand-gold" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Goleadores</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold">
                {activeCategoryName}
              </span>
            </div>
            <div className="p-6">
              <TournamentTopScorers scorers={activeScorers || []} tournamentId={id} />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
