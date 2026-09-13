"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Shield } from "@/components/ui/Shield";
import { GlobalRosterManager } from "@/components/admin/GlobalRosterManager";
import { LogoUploader } from "@/components/admin/LogoUploader";
import { updateTeamLogo } from "@/app/admin/actions";
import styles from "./club-workspace.module.css";
import { ArrowLeft, CalendarDays, MapPin, Trophy, Users } from "lucide-react";

type Team = {
  id: string;
  name: string;
  city?: string | null;
  logo_url?: string | null;
  created_at: string;
};

type Player = {
  id: string;
  name: string;
  number?: number | null;
  date_of_birth?: string | null;
  position?: string | null;
  team_id?: string | null;
};

type TeamTournamentRow = {
  tournament: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
};

export function TeamDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [teamTournaments, setTeamTournaments] = useState<TeamTournamentRow[]>([]);
  const [globalTeamPlayers, setGlobalTeamPlayers] = useState<Player[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!id) return;
    const supabase = createClient();

    // 1. Fetch team details
    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (!teamData) {
      router.push("/admin/teams");
      return;
    }
    setTeam(teamData);

    const { data: tournamentsData } = await supabase
      .from("tournament_teams")
      .select("tournament:tournaments(id, name, slug)")
      .eq("team_id", id);
    if (tournamentsData) setTeamTournaments(tournamentsData);

    const { data: teamPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", id)
      .order("name");
    if (teamPlayers) setGlobalTeamPlayers(teamPlayers);

    // 6. Fetch unassigned players globally (free agents)
    const { data: freePlayers } = await supabase
      .from("players")
      .select("*")
      .is("team_id", null)
      .order("name");
    if (freePlayers) setUnassignedPlayers(freePlayers);

    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAllData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030b17] flex items-center justify-center text-white">
        <Shield className="w-12 h-16 text-brand-teal animate-pulse" />
      </div>
    );
  }

  if (!team) return null;

  return <TeamDetailsView team={team} teamTournaments={teamTournaments} players={globalTeamPlayers} unassignedPlayers={unassignedPlayers}
    onRosterChanged={fetchAllData} onLogoChanged={async (url) => {
      try {
        await updateTeamLogo(id, url);
        await fetchAllData();
      } catch (err) {
        console.error("Error guardando escudo:", err);
      }
    }} />;
}

export function TeamDetailsView({ team, teamTournaments, players, unassignedPlayers, onRosterChanged, onLogoChanged }: {
  team: Team;
  teamTournaments: TeamTournamentRow[];
  players: Player[];
  unassignedPlayers: Player[];
  onRosterChanged: () => void;
  onLogoChanged: (url: string) => void;
}) {
  const createdAtLabel = new Date(team.created_at).toLocaleDateString("es-CO");
  const activeTournamentRows = teamTournaments.filter((row) => row.tournament);

  return (
    <div className={`${styles.workspace} mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:py-10`}>
      <Link href="/admin/teams" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Equipos
      </Link>

      <header className={`${styles.profile} flex flex-row items-start gap-4 pb-8 sm:gap-8 sm:pb-10`}>
        <div className="shrink-0 self-start">
          <LogoUploader compact defaultImage={team.logo_url || undefined} onUploadSuccess={onLogoChanged} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />Perfil del club</p>
          <h1 className="break-words text-3xl font-semibold text-foreground sm:text-5xl">{team.name}</h1>
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="size-4 shrink-0" /><dt className="sr-only">Ciudad</dt><dd>{team.city || "Sin ciudad"}</dd></div>
            <div className="flex items-center gap-2"><CalendarDays className="size-4 shrink-0" /><dt>Creado el</dt><dd>{createdAtLabel}</dd></div>
            <div className="flex items-center gap-2"><Users className="size-4 shrink-0" /><dt className="sr-only">Plantilla</dt><dd>{players.length} jugadores</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-muted-foreground">Torneos</span>
            {activeTournamentRows.length ? activeTournamentRows.map(({ tournament }) => tournament && (
              <Badge key={tournament.id} variant="secondary" render={<Link href={`/admin/tournaments/${tournament.id}`} />}
                className="h-auto max-w-full gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:border-brand-primary/50 hover:bg-muted">
                <Trophy className="size-3.5 shrink-0 text-brand-primary" />
                <span className="whitespace-normal break-words">{tournament.name}</span>
              </Badge>
            )) : <span className="text-sm text-muted-foreground">Sin inscripciones</span>}
          </div>
        </div>
      </header>

      <GlobalRosterManager teamId={team.id} initialPlayers={players} unassignedPlayers={unassignedPlayers} onRosterChanged={onRosterChanged} />
    </div>
  );
}
