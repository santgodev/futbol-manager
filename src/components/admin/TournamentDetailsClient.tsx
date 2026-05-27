"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft, ExternalLink, Users, Calendar, BarChart2, Trophy, AlertTriangle } from "lucide-react";
import { MatchEditor } from "@/components/admin/MatchEditor";
import { TournamentTeamManager } from "@/components/admin/TournamentTeamManager";
import { TournamentStatusSwitcher } from "@/components/admin/TournamentStatusSwitcher";
import { MatchCreator } from "@/components/admin/MatchCreator";
import { TournamentStandings } from "@/components/admin/TournamentStandings";
import { TournamentTopScorers } from "@/components/admin/TournamentTopScorers";
import { TournamentBracket } from "@/components/admin/TournamentBracket";
import { BracketGenerator } from "@/components/admin/BracketGenerator";
import { FixtureGenerator } from "@/components/admin/FixtureGenerator";
import { CompetitionEngine } from "@/utils/CompetitionEngine";

export function TournamentDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinishedMatches, setShowFinishedMatches] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number | "ALL">("ALL");

  const fetchAllData = async () => {
    if (!id) return;
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
    setTournament(tData);

    // 2. Available Teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name");
    if (teamsData) setAvailableTeams(teamsData);

    // 3. Matches
    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url),
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
    if (scorersData) setTopScorers(scorersData);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030b17] flex items-center justify-center text-white">
        <Shield className="w-12 h-16 text-brand-teal animate-pulse" />
      </div>
    );
  }

  if (!tournament) return null;

  const analysis = CompetitionEngine.analyzeTournament(tournament, matches);
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
    teamsWithNoMatches
  } = integrity;

  // For visual filtering UI only
  const groupMatches = matches?.filter((m: any) => !m.is_knockout) || [];
  const uniqueRounds = Array.from(
    new Set(groupMatches.map((m: any) => m.round_number).filter(Boolean))
  ).sort((a: any, b: any) => a - b);

  const filteredMatches = (selectedRound === "ALL" || uniqueRounds.length === 0)
    ? matches
    : matches.filter((m: any) => m.is_knockout || m.round_number === selectedRound);

  const statusColor = (status: string) => {
    if (status?.includes("CURSO"))    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    if (status?.includes("INSCRI"))   return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    if (status?.includes("FINALIZ"))  return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    return "bg-amber-500/20 text-amber-400 border-amber-500/40"; // Próximamente
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">

      {/* ── Back ── */}
      <Link href="/admin font-bold" className="inline-flex items-center gap-2 text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest text-xs font-bold mb-8 transition-colors">
        <ArrowLeft size={14} /> Volver al Dashboard
      </Link>

      {/* ── HEADER ── */}
      <header className="mb-8 bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(0,100,255,0.08)]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0066cc]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
          {/* Logo */}
          <div className="shrink-0 w-20 h-20 rounded-xl bg-[#001133] border border-[#0055cc]/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,100,255,0.2)]">
            {tournament.image_url ? (
              <Image src={tournament.image_url} alt={tournament.name} width={80} height={80} className="object-contain p-1" unoptimized />
            ) : (
              <Trophy size={32} className="text-[#0066cc]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white hero-title !not-italic truncate drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                {tournament.name}
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor(tournament.status)}`}>
                {tournament.status}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.1)]">
                {CompetitionEngine.getFormatLabel(format, isDoubleRound)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                {CompetitionEngine.getStateLabel(state)}
              </span>
              {tournament.category && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#0055cc]/40 bg-[#0055cc]/10 text-[#00f0ff]/80">
                  {tournament.category}
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-4">
              📍 {tournament.location}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-[#00f0ff]" />
                <span className="text-white font-bold">{teamsCount}</span>
                <span className="text-white/50 text-xs">equipos</span>
              </div>
              <div className="w-px h-4 bg-white/10 self-center" />
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-[#00f0ff]" />
                <span className="text-white font-bold">{matchesPlayed}</span>
                <span className="text-white/50 text-xs">/ {theoreticalTotalMatches} partidos</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 shrink-0">
            <TournamentStatusSwitcher tournament={tournament} isDisabled={integritySeverity === "CRITICAL"} />
            <Link
              href={`/t/${tournament.slug}`}
              target="_blank"
              className="flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-brand-teal to-[#00f0ff] text-brand-deep shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <ExternalLink size={14} /> Ver en Vivo
            </Link>
          </div>
        </div>
      </header>

      {/* ── ESTADO DE INTEGRIDAD DEL TORNEO ── */}
      <div className={`mb-8 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md transition-all ${integrityColor}`}>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${integrityDot}`} />
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-white/40 block">Estado de Integridad del Torneo</span>
            <span className="text-sm font-black uppercase tracking-wider block">{integrityLabel}</span>
          </div>
        </div>
        <p className="text-xs text-white/70 max-w-xl leading-relaxed md:border-l md:border-white/10 md:pl-4">
          {integrityDesc}
        </p>
      </div>

      {/* ── TAB SECTIONS ── */}
      <div className="grid grid-cols-1 gap-8">

        {/* ── SECCIÓN 1: Equipos Participantes ── */}
        <section className="bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0055cc]/20 bg-[#001122]/40">
            <Users size={16} className="text-[#00f0ff]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Equipos Participantes
            </h2>
            <span className="ml-auto bg-[#0055cc]/30 text-[#00f0ff] text-xs font-bold px-3 py-1 rounded-full">
              {teamsCount}
            </span>
          </div>
          <div className="p-6">
            <TournamentTeamManager
              tournamentId={id}
              availableTeams={availableTeams || []}
              currentTeams={tournament.tournament_teams || []}
              onUpdate={fetchAllData}
              isDisabled={integritySeverity === "CRITICAL"}
            />
          </div>
        </section>

        {/* ── SECCIÓN 2: Programar Partido ── */}
        {format !== "PLAYOFFS" && (
          <section className="bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/20 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0055cc]/20 bg-[#001122]/40">
              <Calendar size={16} className="text-[#00f0ff]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Programar Nuevo Partido
              </h2>
            </div>
            <div className="p-6">
              {integritySeverity === "CRITICAL" ? (
                <div className="py-8 text-center flex flex-col items-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-black uppercase tracking-[0.2em]">Programación Bloqueada 🔒</span>
                  <p className="text-white/40 text-xs max-w-sm leading-relaxed mx-auto">
                    No puedes programar partidos ni generar fixtures mientras el torneo tenga inconsistencias críticas de integridad. Resuelve las inconsistencias del calendario para continuar.
                  </p>
                </div>
              ) : (
                <>
                  <MatchCreator
                    tournamentId={id}
                    teams={tournament.tournament_teams || []}
                    onUpdate={fetchAllData}
                  />
                  <div className="mt-8 pt-8 border-t border-[#0055cc]/20">
                    <FixtureGenerator 
                      tournamentId={id} 
                      teamsCount={teamsCount}
                      hasGroupMatches={matches?.some((m: any) => m.stage === "GROUP" || m.stage === "GRUPOS")}
                      onUpdate={fetchAllData}
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── SECCIÓN 3: Editor de Marcadores ── */}
        <section className="bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0055cc]/20 bg-[#001122]/40">
            <BarChart2 size={16} className="text-[#00f0ff]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Partidos
            </h2>
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse inline-block" />
                {matches?.filter((m: any) => m.status !== "FINISHED").length ?? 0} pendientes
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {matchesPlayed} jugados
              </span>
            </div>
          </div>
          <div className="p-6">
            {/* ── Warning & Progress stage if matches exist ── */}
            {matches && matches.length > 0 && (
              <>
                {/* ── Warning for teams with 0 matches ── */}
                {teamsWithNoMatches.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3 items-start animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-amber-500 text-xs font-black uppercase tracking-wider mb-1">¡Inconsistencia de Calendario!</h4>
                      <p className="text-white/70 text-xs leading-relaxed">
                        Hay equipos inscritos que no tienen ningún partido programado en la fase de grupos:{" "}
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
                  <div className="mb-6 bg-[#001122]/40 border border-[#0055cc]/20 rounded-xl p-4 relative overflow-hidden shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff]">Progreso Fase de Grupos</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white/90">
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

            {(!matches || matches.length === 0) ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <Calendar size={32} className="text-[#0055cc]/30" />
                <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
                  No hay partidos programados
                </span>
                <p className="text-white/25 text-xs">
                  Inscribe equipos y usa la sección de arriba para programar el primer partido.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* ── Round Selector (Jornadas Tabs) ── */}
                {uniqueRounds.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#00f0ff]/50 block mb-2 font-mono">Filtrar por Jornada</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
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
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal">
                          Partidos Pendientes
                        </span>
                        <div className="flex-1 h-px bg-brand-teal/10" />
                      </div>
                      <div className="flex flex-col gap-4">
                        {pending.map((match: any) => (
                          <MatchEditor key={match.id} match={match} tournamentId={id} />
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
                            <MatchEditor key={match.id} match={match} tournamentId={id} />
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

        {/* ── SECCIÓN 3.5: Fase Eliminatoria ── */}
        {format !== "LEAGUE" && (
          <section className="bg-[#050b14]/80 backdrop-blur-xl border border-brand-teal/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-teal/20 bg-[#0a1526]/40">
              <Trophy size={16} className="text-brand-teal" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Fase Eliminatoria
              </h2>
            </div>
            <div className="p-0">
              {(!matches || !matches.some((m: any) => m.is_knockout)) && (
                <div className="p-6 border-b border-[#0055cc]/20">
                  <BracketGenerator 
                    tournamentId={id} 
                    isGroupStageComplete={isGroupStageComplete}
                    pendingGroupMatchesCount={groupMatchesPending}
                    registeredTeamsCount={teamsCount}
                    matchesPlayed={groupMatchesPlayed}
                  />
                </div>
              )}
              <TournamentBracket matches={matches || []} />
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* ── SECCIÓN 4: Tabla de Posiciones ── */}
          {format !== 'PLAYOFFS' && (
            <section className="xl:col-span-3 bg-[#050b14]/80 backdrop-blur-xl border border-brand-teal/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-teal/20 bg-[#0a1526]/40">
                <Trophy size={16} className="text-brand-teal" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  Tabla de Posiciones
                </h2>
              </div>
              <div className="p-0">
                <TournamentStandings standings={standings || []} />
              </div>
            </section>
          )}

          {/* ── SECCIÓN 5: Top Goleadores ── */}
          <section className={`${format === 'PLAYOFFS' ? 'xl:col-span-5' : 'xl:col-span-2'} bg-[#050b14]/80 backdrop-blur-xl border border-brand-teal/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden`}>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-teal/20 bg-[#0a1526]/40">
              <Trophy size={16} className="text-yellow-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Top Goleadores
              </h2>
            </div>
            <div className="p-6">
              <TournamentTopScorers scorers={topScorers || []} />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
