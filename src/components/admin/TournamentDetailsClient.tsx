"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft, ExternalLink, Users, Calendar, BarChart2, Trophy } from "lucide-react";
import { MatchEditor } from "@/components/admin/MatchEditor";
import { TournamentTeamManager } from "@/components/admin/TournamentTeamManager";
import { TournamentStatusSwitcher } from "@/components/admin/TournamentStatusSwitcher";
import { MatchCreator } from "@/components/admin/MatchCreator";
import { TournamentStandings } from "@/components/admin/TournamentStandings";
import { TournamentTopScorers } from "@/components/admin/TournamentTopScorers";
import { TournamentBracket } from "@/components/admin/TournamentBracket";
import { BracketGenerator } from "@/components/admin/BracketGenerator";
import { FixtureGenerator } from "@/components/admin/FixtureGenerator";

export function TournamentDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      .eq("tournament_id", id);
    if (standingsData) setStandings(standingsData);

    // 5. Top Scorers
    const { data: scorersData } = await supabase
      .from("tournament_top_scorers_view")
      .select("*")
      .eq("tournament_id", id);
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

  const teamsCount = tournament.tournament_teams?.length ?? 0;
  const matchesPlayed = matches?.filter((m: any) => m.status === "FINISHED").length ?? 0;
  const matchesTotal = matches?.length ?? 0;

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
                <span className="text-white/50 text-xs">/ {matchesTotal} partidos</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 shrink-0">
            <TournamentStatusSwitcher tournament={tournament} />
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
            />
          </div>
        </section>

        {/* ── SECCIÓN 2: Programar Partido ── */}
        <section className="bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0055cc]/20 bg-[#001122]/40">
            <Calendar size={16} className="text-[#00f0ff]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Programar Nuevo Partido
            </h2>
          </div>
          <div className="p-6">
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
          </div>
        </section>

        {/* ── SECCIÓN 3: Editor de Marcadores ── */}
        <section className="bg-[#02060d]/60 backdrop-blur-md border border-[#0055cc]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0055cc]/20 bg-[#001122]/40">
            <BarChart2 size={16} className="text-[#00f0ff]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Editor de Marcadores
            </h2>
            <span className="ml-auto text-xs text-white/40 font-medium">
              {matchesTotal} partido{matchesTotal !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {matches?.map((match: any) => (
                <MatchEditor key={match.id} match={match} tournamentId={id} />
              ))}
              {(!matches || matches.length === 0) && (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <Calendar size={32} className="text-[#0055cc]/30" />
                  <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
                    No hay partidos programados
                  </span>
                  <p className="text-white/25 text-xs">
                    Inscribe equipos y usa la sección de arriba para programar el primer partido.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3.5: Fase Eliminatoria ── */}
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
                <BracketGenerator tournamentId={id} />
              </div>
            )}
            <TournamentBracket matches={matches || []} />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── SECCIÓN 4: Tabla de Posiciones ── */}
          <section className="xl:col-span-2 bg-[#050b14]/80 backdrop-blur-xl border border-brand-teal/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
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

          {/* ── SECCIÓN 5: Top Goleadores ── */}
          <section className="xl:col-span-1 bg-[#050b14]/80 backdrop-blur-xl border border-brand-teal/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
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
