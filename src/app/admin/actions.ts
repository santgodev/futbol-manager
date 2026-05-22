"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/login", "layout");
}

export async function updateMatchScore(
  matchId: string, 
  homeScore: number | null, 
  awayScore: number | null,
  tournamentId: string,
  currentVersion: number,
  homePenaltyScore?: number | null,
  awayPenaltyScore?: number | null,
  forceStatus?: string
) {
  const supabase = await createClient();
  
  // 1. Validar que la sesión es de un admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 2. Determinar estado (FINISHED si ambos puntajes están presentes o si se fuerza)
  const status = forceStatus || ((homeScore !== null && awayScore !== null) ? 'FINISHED' : 'SCHEDULED');

  // 3. Actualizar la Base de Datos con Optimistic Locking y Penales
  const { data, error } = await (supabase
    .from("matches") as any)
    .update({ 
      home_score: homeScore, 
      away_score: awayScore,
      home_penalty_score: homePenaltyScore ?? null,
      away_penalty_score: awayPenaltyScore ?? null,
      status: status,
      version: currentVersion + 1,
      updated_by: user.id
    })
    .eq("id", matchId)
    .eq("version", currentVersion)
    .select();

  if (error) throw new Error("Error guardando el marcador: " + error.message);
  
  if (!data || data.length === 0) {
    throw new Error("CONFLICTO: Alguien más actualizó este partido recientemente. Refresca la página.");
  }

  // 4. Refrescar el caché estático
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/t/${tournamentId}`);
  
  return { success: true, newVersion: (data[0] as any).version };
}


export async function createTeam(name: string, logoUrl: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("teams")
    .insert({ name, logo_url: logoUrl })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/teams");
  return { success: true, team: data };
}

export async function createTournament(tournamentData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const slug = tournamentData.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      ...tournamentData,
      slug,
      status: 'PRÓXIMAMENTE'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/tournaments");
  return { success: true, tournament: data };
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_teams")
    .insert({ tournament_id: tournamentId, team_id: teamId });

  if (error) throw new Error(error.message);
  
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  return { success: true };
}

export async function updateTournament(tournamentId: string, updates: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournaments")
    .update(updates)
    .eq("id", tournamentId);

  if (error) throw new Error(error.message);
  
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/admin/tournaments");
  return { success: true };
}

export async function createMatch(matchData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("matches")
    .insert(matchData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath(`/admin/tournaments/${matchData.tournament_id}`);
  return { success: true, match: data };
}

export async function createAndRegisterPlayer(playerName: string, tournamentId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 1. Create player globally
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ name: playerName })
    .select()
    .single();

  if (playerError) throw new Error("Error creando jugador: " + playerError.message);

  // 2. Register in tournament_players
  const { error: registerError } = await supabase
    .from("tournament_players")
    .insert({
      tournament_id: tournamentId,
      player_id: player.id,
      team_id: teamId,
      goals: 0
    });

  if (registerError) throw new Error("Error registrando jugador al equipo: " + registerError.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true, player };
}

export async function addPlayerToTournamentTeam(playerId: string, tournamentId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_players")
    .insert({
      tournament_id: tournamentId,
      player_id: playerId,
      team_id: teamId,
      goals: 0
    });

  if (error) throw new Error("Error asociando jugador al equipo: " + error.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

export async function removePlayerFromTournamentTeam(playerId: string, tournamentId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_players")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId);

  if (error) throw new Error("Error eliminando jugador de la plantilla: " + error.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

export async function updatePlayerGoals(playerId: string, tournamentId: string, teamId: string, goals: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_players")
    .update({ goals: goals })
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId);

  if (error) throw new Error("Error actualizando goles: " + error.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

export async function createGlobalPlayer(playerName: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: player, error } = await supabase
    .from("players")
    .insert({ name: playerName, team_id: teamId })
    .select()
    .single();

  if (error) throw new Error("Error creando jugador del equipo: " + error.message);

  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true, player };
}

export async function addPlayerToTeamGlobally(playerId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("players")
    .update({ team_id: teamId })
    .eq("id", playerId);

  if (error) throw new Error("Error asociando jugador al equipo: " + error.message);

  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

export async function removePlayerFromTeamGlobally(playerId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("players")
    .update({ team_id: null })
    .eq("id", playerId);

  if (error) throw new Error("Error removiendo jugador del equipo: " + error.message);

  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}
