import { createClient } from "@/utils/supabase/client";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
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
  const supabase = createClient();
  
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
  
  // 7. Auto-advance if there is a next match
  let winner_team_id = null;
  if (status === 'FINISHED') {
    const hScore = homeScore || 0;
    const aScore = awayScore || 0;
    const hPen = homePenaltyScore || 0;
    const aPen = awayPenaltyScore || 0;

    if (hScore > aScore) winner_team_id = data[0].home_team_id;
    else if (aScore > hScore) winner_team_id = data[0].away_team_id;
    else if (hPen > aPen) winner_team_id = data[0].home_team_id;
    else if (aPen > hPen) winner_team_id = data[0].away_team_id;
    
    if (winner_team_id && data[0].next_match_id) {
      const nextMatchId = data[0].next_match_id;
      const isHomeSide = data[0].next_match_home_side;
      
      if (isHomeSide !== null) {
        const fieldToUpdate = isHomeSide ? 'home_team_id' : 'away_team_id';
        
        await supabase
          .from('matches')
          .update({ [fieldToUpdate]: winner_team_id })
          .eq('id', nextMatchId);
      }
    }
  }

  return { success: true, newVersion: (data[0] as any).version };
}


export async function createTeam(teamData: {
  name: string;
  logo_url?: string | null;
  city?: string | null;
  primary_color?: string | null;
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("teams")
    .insert({ ...teamData, created_by: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return { success: true, team: data };
}

export async function createTournament(tournamentData: any) {
  const supabase = createClient();
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
  
  return { success: true, tournament: data };
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_teams")
    .insert({ tournament_id: tournamentId, team_id: teamId });

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function updateTournament(tournamentId: string, updates: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournaments")
    .update(updates)
    .eq("id", tournamentId);

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function createMatch(matchData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("matches")
    .insert(matchData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return { success: true, match: data };
}

export async function createPlayer(playerData: {
  team_id: string;
  name: string;
  document_id?: string | null;
  date_of_birth?: string | null;
  number?: number | null;
  position?: string | null;
  photo_url?: string | null;
}) {
  const supabase = createClient();
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
  
  return { success: true, player: data };
}

export async function deletePlayer(playerId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Soft-delete: desactivar en lugar de borrar para preservar estadísticas históricas
  const { error } = await supabase
    .from("players")
    .update({ is_active: false })
    .eq("id", playerId)
    .eq("created_by", user.id); // Solo el creador puede borrar

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function createMatchEvent(eventData: {
  match_id: string;
  tournament_id: string;
  team_id: string;
  player_id?: string | null;
  type: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION";
  minute?: number | null;
  description?: string | null;
}) {
  const supabase = createClient();
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

  return { success: true, event: data };
}

export async function createAndRegisterPlayer(playerName: string, tournamentId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 1. Create player globally, assigned to the team
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ name: playerName, team_id: teamId, created_by: user.id, is_active: true })
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

  return { success: true, player };
}

export async function addPlayerToTournamentTeam(playerId: string, tournamentId: string, teamId: string) {
  const supabase = createClient();
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

  return { success: true };
}

export async function removePlayerFromTournamentTeam(playerId: string, tournamentId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_players")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId);

  if (error) throw new Error("Error eliminando jugador de la plantilla: " + error.message);

  return { success: true };
}

export async function updatePlayerGoals(playerId: string, tournamentId: string, teamId: string, goals: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_players")
    .update({ goals: goals })
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId);

  if (error) throw new Error("Error actualizando goles: " + error.message);

  return { success: true };
}

export async function createGlobalPlayer(playerName: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: player, error } = await supabase
    .from("players")
    .insert({ name: playerName, team_id: teamId, created_by: user.id, is_active: true })
    .select()
    .single();

  if (error) throw new Error("Error creando jugador del equipo: " + error.message);

  return { success: true, player };
}

export async function addPlayerToTeamGlobally(playerId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("players")
    .update({ team_id: teamId })
    .eq("id", playerId)
    .select();

  if (error) throw new Error("Error asociando jugador al equipo: " + error.message);
  if (!data || data.length === 0) throw new Error("No se pudo asignar el jugador. Es posible que no tengas permiso para modificarlo.");

  return { success: true };
}

export async function removePlayerFromTeamGlobally(playerId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("players")
    .update({ team_id: null })
    .eq("id", playerId);

  if (error) throw new Error("Error removiendo jugador del equipo: " + error.message);

  return { success: true };
}

export async function generateKnockoutBracket(tournamentId: string, teamsCount: 2 | 4 | 8) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // 1. Validar que no haya partidos eliminatorios ya finalizados
  const { data: existingKnockouts, error: existingErr } = await supabase
    .from('matches')
    .select('id, status')
    .eq('tournament_id', tournamentId)
    .eq('is_knockout', true);
    
  if (existingErr) throw new Error("Error verificando bracket existente");
  
  const hasFinished = existingKnockouts.some(m => m.status === 'FINISHED');
  if (hasFinished) {
    throw new Error("No se puede regenerar el bracket porque ya hay partidos eliminatorios finalizados.");
  }

  // Borrar los existentes no finalizados
  if (existingKnockouts.length > 0) {
    await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('is_knockout', true);
  }

  // 2. Obtener los mejores equipos de la fase de grupos usando la vista
  const { data: standings, error: standingsErr } = await supabase
    .from('tournament_standings_view')
    .select('team_id')
    .eq('tournament_id', tournamentId)
    .order('points', { ascending: false })
    .order('goals_for', { ascending: false })
    .limit(teamsCount);

  if (standingsErr) throw new Error("Error obteniendo tabla de posiciones");
  if (standings.length < teamsCount) throw new Error(`No hay suficientes equipos. Se requieren ${teamsCount}.`);

  const topTeams = standings.map(s => s.team_id);

  // 3. Generar Árbol
  const matchesToInsert: any[] = [];
  
  if (teamsCount === 2) {
    matchesToInsert.push({
      tournament_id: tournamentId,
      stage: 'FINAL',
      is_knockout: true,
      home_team_id: topTeams[0],
      away_team_id: topTeams[1],
      bracket_order: 1,
      status: 'SCHEDULED'
    });
    const { error: insertErr } = await supabase.from('matches').insert(matchesToInsert);
    if (insertErr) throw new Error("Error insertando Final: " + insertErr.message);
  } else if (teamsCount === 4) {
    const { data: finalData, error: finalErr } = await supabase.from('matches').insert({
      tournament_id: tournamentId, stage: 'FINAL', is_knockout: true, bracket_order: 1, status: 'SCHEDULED'
    }).select().single();
    if (finalErr) throw new Error("Error creando Final");
    
    matchesToInsert.push({ tournament_id: tournamentId, stage: 'SEMIFINAL', is_knockout: true, home_team_id: topTeams[0], away_team_id: topTeams[3], bracket_order: 1, status: 'SCHEDULED', next_match_id: finalData.id, next_match_home_side: true });
    matchesToInsert.push({ tournament_id: tournamentId, stage: 'SEMIFINAL', is_knockout: true, home_team_id: topTeams[1], away_team_id: topTeams[2], bracket_order: 2, status: 'SCHEDULED', next_match_id: finalData.id, next_match_home_side: false });
    
    const { error: semiErr } = await supabase.from('matches').insert(matchesToInsert);
    if (semiErr) throw new Error("Error creando Semifinales: " + semiErr.message);
  } else if (teamsCount === 8) {
    const { data: finalData, error: finalErr } = await supabase.from('matches').insert({
      tournament_id: tournamentId, stage: 'FINAL', is_knockout: true, bracket_order: 1, status: 'SCHEDULED'
    }).select().single();
    if (finalErr) throw new Error("Error creando Final");

    const { data: semiData, error: semiErr } = await supabase.from('matches').insert([
      { tournament_id: tournamentId, stage: 'SEMIFINAL', is_knockout: true, bracket_order: 1, status: 'SCHEDULED', next_match_id: finalData.id, next_match_home_side: true },
      { tournament_id: tournamentId, stage: 'SEMIFINAL', is_knockout: true, bracket_order: 2, status: 'SCHEDULED', next_match_id: finalData.id, next_match_home_side: false }
    ]).select();
    if (semiErr) throw new Error("Error creando Semis");

    const semi1 = semiData.find(s => s.bracket_order === 1);
    const semi2 = semiData.find(s => s.bracket_order === 2);

    matchesToInsert.push({ tournament_id: tournamentId, stage: 'QUARTERFINAL', is_knockout: true, home_team_id: topTeams[0], away_team_id: topTeams[7], bracket_order: 1, status: 'SCHEDULED', next_match_id: semi1?.id, next_match_home_side: true });
    matchesToInsert.push({ tournament_id: tournamentId, stage: 'QUARTERFINAL', is_knockout: true, home_team_id: topTeams[3], away_team_id: topTeams[4], bracket_order: 2, status: 'SCHEDULED', next_match_id: semi1?.id, next_match_home_side: false });
    matchesToInsert.push({ tournament_id: tournamentId, stage: 'QUARTERFINAL', is_knockout: true, home_team_id: topTeams[1], away_team_id: topTeams[6], bracket_order: 3, status: 'SCHEDULED', next_match_id: semi2?.id, next_match_home_side: true });
    matchesToInsert.push({ tournament_id: tournamentId, stage: 'QUARTERFINAL', is_knockout: true, home_team_id: topTeams[2], away_team_id: topTeams[5], bracket_order: 4, status: 'SCHEDULED', next_match_id: semi2?.id, next_match_home_side: false });

    const { error: qfErr } = await supabase.from('matches').insert(matchesToInsert);
    if (qfErr) throw new Error("Error creando Cuartos: " + qfErr.message);
  }

  return { success: true };
}

export async function updateMatchSchedule(matchId: string, matchDate: string, matchTime: string, tournamentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("matches")
    .update({ match_date: matchDate, match_time: matchTime })
    .eq("id", matchId);

  if (error) throw new Error("Error agendando partido: " + error.message);

  return { success: true };
}

export async function deleteMatchEvent(
  eventId: string,
  tournamentId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: event, error: fetchError } = await supabase
    .from("match_events")
    .select("id, match_id, team_id, type")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError) throw new Error("Error al buscar el evento: " + fetchError.message);
  if (!event) throw new Error("El evento no existe o ya fue eliminado.");

  const { error: deleteError } = await supabase
    .from("match_events")
    .delete()
    .eq("id", eventId);

  if (deleteError) throw new Error("Error al eliminar el evento: " + deleteError.message);

  const affectsScore = event.type === "GOAL" || event.type === "OWN_GOAL";

  if (affectsScore) {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id, home_score, away_score, version")
      .eq("id", event.match_id)
      .single();

    if (matchError || !match) throw new Error("No se pudo leer el partido para ajustar el marcador.");

    const isHome = match.home_team_id === event.team_id;

    let subHome = 0;
    let subAway = 0;

    if (event.type === "GOAL") {
      if (isHome) subHome = 1; else subAway = 1;
    } else if (event.type === "OWN_GOAL") {
      if (isHome) subAway = 1; else subHome = 1;
    }

    const { error: updateError } = await supabase
      .from("matches")
      .update({
        home_score: Math.max(0, (match.home_score ?? 0) - subHome),
        away_score: Math.max(0, (match.away_score ?? 0) - subAway),
        version: match.version + 1,
        updated_by: user.id,
      })
      .eq("id", event.match_id)
      .eq("version", match.version); 

    if (updateError) throw new Error("Error de concurrencia al ajustar el marcador. Recarga la página.");
  }

  return { success: true };
}

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: existing, error: fetchError } = await supabase
    .from("match_events")
    .select("id, match_id, type")
    .eq("id", eventId)
    .eq("match_id", matchId)
    .maybeSingle();

  if (fetchError) throw new Error("Error al verificar el evento: " + fetchError.message);
  if (!existing) throw new Error("El evento no existe o no pertenece a este partido.");

  const safeUpdates: Record<string, unknown> = {};
  if (updates.minute   !== undefined) safeUpdates.minute      = updates.minute;
  if (updates.player_id !== undefined) safeUpdates.player_id  = updates.player_id;
  if (updates.description !== undefined) safeUpdates.description = updates.description;

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error("No se especificó ningún campo para actualizar.");
  }

  const { error: updateError } = await supabase
    .from("match_events")
    .update(safeUpdates)
    .eq("id", eventId);

  if (updateError) throw new Error("Error al actualizar el evento: " + updateError.message);

  return { success: true };
}

export async function toggleMatchClock(
  matchId: string,
  isStarting: boolean,
  currentElapsedSeconds: number,
  tournamentId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();
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

  return { success: true };
}

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

  return { success: true };
}

export async function generateRoundRobinFixture(tournamentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { count, error: countError } = await supabase
    .from("matches")
    .select("*", { count: 'exact', head: true })
    .eq("tournament_id", tournamentId)
    .eq("stage", "GROUP");

  if (countError) throw new Error("Error verificando partidos existentes.");
  if (count && count > 0) {
    throw new Error(`CONCURRENCIA/BLOQUEO: Ya existen ${count} partidos de Fase de Grupos. No se puede generar un fixture automático para evitar duplicados.`);
  }

  const { data: tournamentTeams, error: teamsError } = await supabase
    .from("tournament_teams")
    .select("team_id")
    .eq("tournament_id", tournamentId);

  if (teamsError || !tournamentTeams) throw new Error("Error obteniendo los equipos del torneo.");
  if (tournamentTeams.length < 3) throw new Error("Se requieren al menos 3 equipos inscritos para generar un fixture automático.");

  let teams = tournamentTeams.map(t => t.team_id);
  const hasGhost = teams.length % 2 !== 0;
  if (hasGhost) {
    teams.push("GHOST"); 
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesToInsert: any[] = [];

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];

      if (home !== "GHOST" && away !== "GHOST") {
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

    const pivot = teams[0];
    const last = teams.pop()!;
    teams = [pivot, last, ...teams.slice(1)];
  }

  const { error: insertError } = await supabase
    .from("matches")
    .insert(matchesToInsert);

  if (insertError) throw new Error("Error al insertar el fixture: " + insertError.message);

  return { success: true, matchesGenerated: matchesToInsert.length, rounds: numRounds };
}
