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
  forceStatus?: string,
  matchDate?: string | null,
  matchTime?: string | null
) {
  const supabase = await createClient();
  
  // 1. Validar que la sesión es de un admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 2. Determinar estado (FINISHED si ambos puntajes están presentes o si se fuerza)
  const status = forceStatus || ((homeScore !== null && awayScore !== null) ? 'FINISHED' : 'SCHEDULED');

  // 3. Obtener equipos para determinar el ganador
  let winner_team_id = null;
  if (status === 'FINISHED') {
    const { data: matchMeta } = await supabase
      .from('matches')
      .select('home_team_id, away_team_id')
      .eq('id', matchId)
      .single();

    if (matchMeta) {
      const hScore = homeScore || 0;
      const aScore = awayScore || 0;
      const hPen = homePenaltyScore || 0;
      const aPen = awayPenaltyScore || 0;

      if (hScore > aScore) {
        winner_team_id = matchMeta.home_team_id;
      } else if (aScore > hScore) {
        winner_team_id = matchMeta.away_team_id;
      } else if (hPen > aPen) {
        winner_team_id = matchMeta.home_team_id;
      } else if (aPen > hPen) {
        winner_team_id = matchMeta.away_team_id;
      }
    }
  }

  // 5. Build update object
  const updateData: any = {
    home_score: homeScore, 
    away_score: awayScore,
    home_penalty_score: homePenaltyScore ?? null,
    away_penalty_score: awayPenaltyScore ?? null,
    status: status,
    version: currentVersion + 1,
    updated_by: user.id,
    winner_team_id: winner_team_id
  };
  
  if (matchDate !== undefined) updateData.match_date = matchDate;
  if (matchTime !== undefined) updateData.match_time = matchTime;

  // 6. Actualizar la Base de Datos con Optimistic Locking y Penales
  const { data, error } = await supabase
    .from("matches")
    .update(updateData)
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
  
  return { success: true, newVersion: data[0].version };
}

export async function updateMatchSchedule(matchId: string, matchDate: string, matchTime: string, tournamentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("matches")
    .update({ match_date: matchDate, match_time: matchTime })
    .eq("id", matchId);

  if (error) throw new Error("Error agendando partido: " + error.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  return { success: true };
}


export async function createTeam(teamData: {
  name: string;
  logo_url?: string | null;
  city?: string | null;
  primary_color?: string | null;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("teams")
    .insert({ ...teamData, created_by: user.id })
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
      status: 'PRÓXIMAMENTE', // Default value
      ...tournamentData,
      slug,
      created_by: user.id
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

// ─────────────────────────────────────────────────────────────
// AGENDAR JORNADA (Round Scheduler)
// ─────────────────────────────────────────────────────────────
export async function scheduleRound(
  tournamentId: string,
  roundNumber: number,
  matchDate: string,
  matchTime: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  if (!matchDate) throw new Error("La fecha es requerida.");
  if (!matchTime) throw new Error("La hora es requerida.");

  const { error } = await supabase
    .from("matches")
    .update({ match_date: matchDate, match_time: matchTime })
    .eq("tournament_id", tournamentId)
    .eq("round_number", roundNumber)
    .eq("stage", "GROUP");

  if (error) throw new Error("Error agendando la jornada: " + error.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  return { success: true };
}

export async function generateRoundRobinFixture(tournamentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 1. Hard Block: Check if GROUP matches already exist
  const { count, error: countError } = await supabase
    .from("matches")
    .select("*", { count: 'exact', head: true })
    .eq("tournament_id", tournamentId)
    .eq("stage", "GROUP");

  if (countError) throw new Error("Error verificando partidos existentes.");
  if (count && count > 0) {
    throw new Error(`CONCURRENCIA/BLOQUEO: Ya existen ${count} partidos de Fase de Grupos. No se puede generar un fixture automático para evitar duplicados.`);
  }

  // 2. Fetch Teams
  const { data: tournamentTeams, error: teamsError } = await supabase
    .from("tournament_teams")
    .select("team_id")
    .eq("tournament_id", tournamentId);

  if (teamsError || !tournamentTeams) throw new Error("Error obteniendo los equipos del torneo.");
  if (tournamentTeams.length < 3) throw new Error("Se requieren al menos 3 equipos inscritos para generar un fixture automático.");

  // 3. Round Robin Algorithm (Circle Method with alternating home/away)
  let teams = tournamentTeams.map(t => t.team_id);
  const hasGhost = teams.length % 2 !== 0;
  if (hasGhost) {
    teams.push("GHOST"); // Dummy team
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesToInsert: any[] = [];

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];

      // Ignorar el partido si uno es el GHOST (descansa)
      if (home !== "GHOST" && away !== "GHOST") {
        // Balance local/visitante: alternar para el pivot (i=0) y en general
        // Si la ronda es par y es el pivot, se invierte
        let finalHome = home;
        let finalAway = away;
        
        if (i === 0 && round % 2 !== 0) {
           finalHome = away;
           finalAway = home;
        }

        matchesToInsert.push({
          tournament_id: tournamentId,
          home_team_id: finalHome,
          away_team_id: finalAway,
          stage: "GROUP",
          is_knockout: false,
          round_number: round + 1,
        });
      }
    }

    // Rotar equipos (excepto el índice 0)
    const pivot = teams[0];
    const last = teams.pop()!;
    teams = [pivot, last, ...teams.slice(1)];
  }

  // 4. Insert Matches
  const { error: insertError } = await supabase
    .from("matches")
    .insert(matchesToInsert);

  if (insertError) throw new Error("Error al insertar el fixture: " + insertError.message);

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  return { success: true, matchesGenerated: matchesToInsert.length, rounds: numRounds };
}

// ─────────────────────────────────────────────────────────────
// JUGADORES
// ─────────────────────────────────────────────────────────────
export async function createPlayer(playerData: {
  team_id: string;
  name: string;
  document_id?: string | null;
  date_of_birth?: string | null;
  number?: number | null;
  position?: string | null;
  photo_url?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Validar que el dorsal no esté duplicado en el equipo
  if (playerData.number) {
    const { data: existing } = await supabase
      .from("players")
      .select("id")
      .eq("team_id", playerData.team_id)
      .eq("number", playerData.number)
      .maybeSingle();
    if (existing) throw new Error(`El dorsal #${playerData.number} ya está en uso en este equipo.`);
  }

  // Validar documento duplicado globalmente
  if (playerData.document_id) {
    const { data: existingDoc } = await supabase
      .from("players")
      .select("id, name")
      .eq("document_id", playerData.document_id)
      .maybeSingle();
    if (existingDoc) throw new Error(`El documento ${playerData.document_id} ya está registrado para el jugador ${existingDoc.name}.`);
  }

  const { data, error } = await supabase
    .from("players")
    .insert({ ...playerData, created_by: user.id, is_active: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath(`/admin/teams/${playerData.team_id}`);
  return { success: true, player: data };
}

export async function deletePlayer(playerId: string, teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Soft-delete: desactivar en lugar de borrar para preservar estadísticas históricas
  const { error } = await supabase
    .from("players")
    .update({ is_active: false })
    .eq("id", playerId)
    .eq("created_by", user.id); // Solo el creador puede borrar

  if (error) throw new Error(error.message);
  
  revalidatePath(`/admin/teams/${teamId}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// EVENTOS DE PARTIDO (Goles, Tarjetas)
// ─────────────────────────────────────────────────────────────
export async function createMatchEvent(eventData: {
  match_id: string;
  tournament_id: string;
  team_id: string;
  player_id?: string | null;
  type: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION";
  minute?: number | null;
  description?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("match_events")
    .insert({ ...eventData, created_by: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Si es un gol o autogol, actualizar el marcador automáticamente
  if (eventData.type === "GOAL" || eventData.type === "OWN_GOAL") {
    const { data: match } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id, home_score, away_score, version")
      .eq("id", eventData.match_id)
      .single();

    if (match) {
      // isHome indica si el equipo del jugador que hizo el evento es el local
      const isHome = match.home_team_id === eventData.team_id;
      
      // Si es GOAL normal, suma al equipo del jugador.
      // Si es OWN_GOAL (Autogol), suma al equipo CONTRARIO.
      let addHome = 0;
      let addAway = 0;
      
      if (eventData.type === "GOAL") {
        if (isHome) addHome = 1; else addAway = 1;
      } else if (eventData.type === "OWN_GOAL") {
        if (isHome) addAway = 1; else addHome = 1;
      }

      await supabase
        .from("matches")
        .update({
          home_score: (match.home_score ?? 0) + addHome,
          away_score: (match.away_score ?? 0) + addAway,
          version: match.version + 1,
          updated_by: user.id
        })
        .eq("id", eventData.match_id);
    }
  }

  revalidatePath(`/admin/tournaments/${eventData.tournament_id}`);
  revalidatePath(`/t/${eventData.tournament_id}`);
  return { success: true, event: data };
}

// ─────────────────────────────────────────────────────────────
// ELIMINAR EVENTO DE PARTIDO
// ─────────────────────────────────────────────────────────────
export async function deleteMatchEvent(
  eventId: string,
  tournamentId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // 1. Validar sesión activa
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 2. Leer el evento ANTES de eliminarlo para saber su tipo y equipo
  const { data: event, error: fetchError } = await supabase
    .from("match_events")
    .select("id, match_id, team_id, type")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError) throw new Error("Error al buscar el evento: " + fetchError.message);
  if (!event) throw new Error("El evento no existe o ya fue eliminado.");

  // 3. Eliminar el evento de la base de datos
  const { error: deleteError } = await supabase
    .from("match_events")
    .delete()
    .eq("id", eventId);

  if (deleteError) throw new Error("Error al eliminar el evento: " + deleteError.message);

  // 4. Solo GOAL y OWN_GOAL afectan el marcador — tarjetas y cambios no
  const affectsScore = event.type === "GOAL" || event.type === "OWN_GOAL";

  if (affectsScore) {
    // Leer el partido actual con su versión para el optimistic lock
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id, home_score, away_score, version")
      .eq("id", event.match_id)
      .single();

    if (matchError || !match) throw new Error("No se pudo leer el partido para ajustar el marcador.");

    const isHome = match.home_team_id === event.team_id;

    // Calcular la corrección inversa (resta en lugar de suma)
    let subHome = 0;
    let subAway = 0;

    if (event.type === "GOAL") {
      // El gol sumó al equipo del jugador → restamos al mismo equipo
      if (isHome) subHome = 1; else subAway = 1;
    } else if (event.type === "OWN_GOAL") {
      // El autogol sumó al equipo CONTRARIO → restamos al contrario
      if (isHome) subAway = 1; else subHome = 1;
    }

    // Actualizar marcador con protección contra negativos y con optimistic lock
    const { error: updateError } = await supabase
      .from("matches")
      .update({
        home_score: Math.max(0, (match.home_score ?? 0) - subHome),
        away_score: Math.max(0, (match.away_score ?? 0) - subAway),
        version: match.version + 1,
        updated_by: user.id,
      })
      .eq("id", event.match_id)
      .eq("version", match.version); // Optimistic lock: falla si alguien modificó antes

    if (updateError) throw new Error("Error de concurrencia al ajustar el marcador. Recarga la página.");
  }

  // 5. Refrescar caché estático en ambas rutas (admin + pública)
  revalidatePath(`/admin/matches/${event.match_id}`);
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/t/${tournamentId}`);

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// ACTUALIZAR CAMPOS SEGUROS DE UN EVENTO (Minuto / Jugador)
// ─────────────────────────────────────────────────────────────
export async function updateMatchEventFields(
  eventId: string,
  updates: {
    minute?: number | null;
    player_id?: string | null;
    description?: string | null;
  },
  matchId: string,
  tournamentId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // 1. Validar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 2. Verificar que el evento existe y pertenece al partido indicado
  const { data: existing, error: fetchError } = await supabase
    .from("match_events")
    .select("id, match_id, type")
    .eq("id", eventId)
    .eq("match_id", matchId)
    .maybeSingle();

  if (fetchError) throw new Error("Error al verificar el evento: " + fetchError.message);
  if (!existing) throw new Error("El evento no existe o no pertenece a este partido.");

  // 3. Construir el objeto de actualización con solo los campos permitidos
  //    type, team_id, match_id, tournament_id NUNCA se modifican desde aquí.
  const safeUpdates: Record<string, unknown> = {};
  if (updates.minute   !== undefined) safeUpdates.minute      = updates.minute;
  if (updates.player_id !== undefined) safeUpdates.player_id  = updates.player_id;
  if (updates.description !== undefined) safeUpdates.description = updates.description;

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error("No se especificó ningún campo para actualizar.");
  }

  // 4. Ejecutar la actualización
  const { error: updateError } = await supabase
    .from("match_events")
    .update(safeUpdates)
    .eq("id", eventId);

  if (updateError) throw new Error("Error al actualizar el evento: " + updateError.message);

  // 5. Revalidar — la vista top_scorers_view es dinámica:
  //    cambiar player_id en un GOAL actualiza goleadores automáticamente.
  revalidatePath(`/admin/matches/${matchId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/t/${tournamentId}`);

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// CONTROL DEL CRONÓMETRO DEL PARTIDO
// ─────────────────────────────────────────────────────────────
export async function toggleMatchClock(
  matchId: string,
  isStarting: boolean,
  currentElapsedSeconds: number,
  tournamentId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // 1. Validar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const updates: Record<string, unknown> = {
    clock_status: isStarting ? 'RUNNING' : 'STOPPED',
    clock_elapsed_seconds: currentElapsedSeconds,
    updated_by: user.id
  };

  if (isStarting) {
    updates.clock_last_started_at = new Date().toISOString();
  } else {
    updates.clock_last_started_at = null;
  }

  const { error: updateError } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", matchId);

  if (updateError) throw new Error("Error al actualizar el cronómetro: " + updateError.message);

  revalidatePath(`/admin/matches/${matchId}`);
  revalidatePath(`/t/${tournamentId}`);
  // No revalidamos el admin/tournaments/ID completo para no hacer overhead si no es necesario

  return { success: true };
}
