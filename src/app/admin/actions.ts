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


function sanitizeTeamName(rawName: string): string {
  return rawName
    .trim()
    .split(/\s+/)
    .map(word => {
      const upperWord = word.toUpperCase();
      if (["FC", "CF", "CD", "SC", "AC", "FK", "F.C."].includes(upperWord)) {
        return upperWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function sanitizePlayerName(rawName: string): string {
  return rawName
    .trim()
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
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

  const cleanName = sanitizeTeamName(teamData.name);

  // Validar duplicado exacto sin distinción de mayúsculas/minúsculas y espacios
  const { data: existingTeam } = await supabase
    .from("teams")
    .select("id")
    .ilike("name", cleanName)
    .maybeSingle();

  if (existingTeam) {
    throw new Error(`Ya existe un equipo registrado con el nombre "${cleanName}".`);
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({ ...teamData, name: cleanName, created_by: user.id })
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

export async function addTeamToTournament(tournamentId: string, teamId: string, groupName?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_teams")
    .insert({ tournament_id: tournamentId, team_id: teamId, group_name: groupName || null });

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function removeTeamFromTournament(tournamentId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_teams")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function removeTeamFromGroup(tournamentId: string, teamId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_teams")
    .update({ group_name: null })
    .eq("tournament_id", tournamentId)
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function assignTeamToGroup(tournamentId: string, teamId: string, groupName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("tournament_teams")
    .update({ group_name: groupName })
    .eq("tournament_id", tournamentId)
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function generateRandomGroups(tournamentId: string, groupSize: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: teams, error: teamsError } = await supabase
    .from("tournament_teams")
    .select("team_id")
    .eq("tournament_id", tournamentId);

  if (teamsError) throw new Error(teamsError.message);
  if (!teams || teams.length === 0) throw new Error("No hay equipos inscritos para generar grupos.");

  // Fisher-Yates shuffle
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Calcular cuántos grupos enteros se pueden formar
  const numGroups = Math.max(1, Math.floor(shuffled.length / groupSize));
  
  const groups = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const updates = [];
  
  // Primero distribuimos los equipos para cumplir el tamaño base de cada grupo
  for (let i = 0; i < numGroups * groupSize; i++) {
    const groupIndex = Math.floor(i / groupSize);
    const groupName = groups[groupIndex] || "Z"; 
    
    updates.push({
      tournament_id: tournamentId,
      team_id: shuffled[i].team_id,
      group_name: groupName
    });
  }

  // Si sobran equipos (el remanente), los repartimos 1 a 1 entre los grupos existentes
  // para evitar que quede un grupo con 1 solo equipo.
  let remainderIndex = 0;
  for (let i = numGroups * groupSize; i < shuffled.length; i++) {
    const groupName = groups[remainderIndex % numGroups] || "Z";
    updates.push({
      tournament_id: tournamentId,
      team_id: shuffled[i].team_id,
      group_name: groupName
    });
    remainderIndex++;
  }

  const { error: upsertError } = await supabase
    .from("tournament_teams")
    .upsert(updates, { onConflict: "tournament_id,team_id" });

  if (upsertError) throw new Error(upsertError.message);

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

  const cleanName = sanitizePlayerName(playerData.name);

  const { data, error } = await supabase
    .from("players")
    .insert({ ...playerData, name: cleanName, created_by: user.id, is_active: true })
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

  // Regla: 2 Amarillas = Roja automática
  if (eventData.type === "YELLOW_CARD" && eventData.player_id) {
    const { count } = await supabase
      .from("match_events")
      .select("*", { count: 'exact', head: true })
      .eq("match_id", eventData.match_id)
      .eq("player_id", eventData.player_id)
      .eq("type", "YELLOW_CARD");

    if (count && count >= 2) {
      await supabase
        .from("match_events")
        .insert({
          match_id: eventData.match_id,
          tournament_id: eventData.tournament_id,
          team_id: eventData.team_id,
          player_id: eventData.player_id,
          type: "RED_CARD",
          minute: eventData.minute,
          description: "Doble Amarilla",
          created_by: user.id
        });
    }
  }

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
  const cleanName = sanitizePlayerName(playerName);
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ name: cleanName, team_id: teamId, created_by: user.id, is_active: true })
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

export async function createGlobalPlayer(
  playerName: string,
  teamId: string,
  jerseyNumber?: number | null,
  dateOfBirth?: string | null,
  position?: string | null
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const cleanName = sanitizePlayerName(playerName);
  const insertData: Record<string, unknown> = {
    name: cleanName,
    team_id: teamId,
    created_by: user.id,
    is_active: true,
  };

  if (jerseyNumber !== null && jerseyNumber !== undefined) insertData.number = jerseyNumber;
  if (dateOfBirth) insertData.date_of_birth = dateOfBirth;
  if (position) insertData.position = position;

  const { data: player, error } = await supabase
    .from("players")
    .insert(insertData)
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

export async function updateGlobalPlayer(
  playerId: string,
  name: string,
  number: number | null,
  dateOfBirth: string | null,
  position: string | null
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const cleanName = sanitizePlayerName(name);
  const { data, error } = await supabase
    .from("players")
    .update({
      name: cleanName,
      number,
      date_of_birth: dateOfBirth,
      position
    })
    .eq("id", playerId)
    .select()
    .single();

  if (error) throw new Error("Error actualizando jugador: " + error.message);
  return { success: true, player: data };
}


export async function updateTeamLogo(teamId: string, logoUrl: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { error } = await supabase
    .from("teams")
    .update({ logo_url: logoUrl })
    .eq("id", teamId);

  if (error) throw new Error("Error actualizando el escudo del equipo: " + error.message);

  return { success: true };
}

export async function generateKnockoutBracket(tournamentId: string, teamsCount: 2 | 4 | 8) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  // Validar formato del torneo
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('format, is_double_round')
    .eq('id', tournamentId)
    .single();

  if (tErr || !tournament) throw new Error("Error consultando el torneo.");
  if (tournament.format === 'LEAGUE') {
    throw new Error("No se pueden generar eliminatorias en un torneo con formato de Liga Directa.");
  }

  // 1. Validar que la fase de grupos esté matemáticamente terminada y sea consistente
  const { data: groupMatches, error: gmErr } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .or('stage.eq.GROUP,stage.eq.GRUPOS');

  if (gmErr) throw new Error("Error consultando partidos de fase de grupos");

  const { data: registeredTeams, error: rtErr } = await supabase
    .from('tournament_teams')
    .select('team_id')
    .eq('tournament_id', tournamentId);

  if (rtErr || !registeredTeams) throw new Error("Error consultando equipos inscritos");

  if (tournament.format !== 'PLAYOFFS') {
    // A. Validar que todos los partidos creados estén finalizados
    const pendingGroup = groupMatches?.filter((m: any) => m.status !== 'FINISHED') || [];
    if (pendingGroup.length > 0) {
      throw new Error("No se pueden generar eliminatorias: Quedan partidos de grupos programados que aún no se han jugado.");
    }

    // B. Validar consistencia de partidos jugados vs requeridos (Todos contra todos)
    const N = registeredTeams.length;
    const isDoubleRound = !!tournament.is_double_round;
    const singleRoundMatches = N >= 2 ? (N * (N - 1)) / 2 : 0;
    const requiredMatches = isDoubleRound ? singleRoundMatches * 2 : singleRoundMatches;
    const finishedGroup = groupMatches?.filter((m: any) => m.status === 'FINISHED') || [];

    if (finishedGroup.length < requiredMatches) {
      throw new Error(`Lógica competitiva rota: Se requieren jugar ${requiredMatches} partidos de grupo (todos contra todos para ${N} equipos) para generar las llaves, pero solo se han jugado ${finishedGroup.length} partidos.`);
    }

    // C. Validar que no haya equipos sin haber jugado partidos
    const teamsWithNoMatches = registeredTeams.filter((tt: any) => {
      return !groupMatches?.some((m: any) => 
        m.status === 'FINISHED' && (m.home_team_id === tt.team_id || m.away_team_id === tt.team_id)
      );
    });

    if (teamsWithNoMatches.length > 0) {
      throw new Error("Lógica competitiva rota: Hay equipos inscritos que no han disputado ningún partido en el calendario de grupos. No se pueden generar cruces justos.");
    }
  }

  // 2. Validar que no haya partidos eliminatorios ya finalizados
  const { data: existingKnockouts, error: existingErr } = await supabase
    .from('matches')
    .select('id, status')
    .eq('tournament_id', tournamentId)
    .eq('is_knockout', true);
    
  if (existingErr) throw new Error("Error verificando bracket existente");
  
  const hasFinished = existingKnockouts?.some((m: any) => m.status === 'FINISHED') || false;
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

  let topTeams: string[] = [];

  if (tournament.format === 'PLAYOFFS') {
    // Para eliminación directa, tomamos los equipos inscritos directamente
    const { data: ttTeams, error: ttErr } = await supabase
      .from('tournament_teams')
      .select('team_id')
      .eq('tournament_id', tournamentId)
      .limit(teamsCount);

    if (ttErr || !ttTeams) throw new Error("Error obteniendo los equipos inscritos");
    if (ttTeams.length < teamsCount) throw new Error(`No hay suficientes equipos inscritos en el torneo. Se requieren ${teamsCount} pero solo hay ${ttTeams.length}.`);
    
    topTeams = ttTeams.map((t: any) => t.team_id);
  } else {
    // Obtener todas las posiciones de todos los grupos
    const { data: standings, error: standingsErr } = await supabase
      .from('tournament_standings_view')
      .select('team_id, group_name')
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false })
      .order('goal_difference', { ascending: false })
      .order('goals_for', { ascending: false });

    if (standingsErr) throw new Error("Error obteniendo tabla de posiciones");

    // Agrupar los standings por grupo
    const grouped: Record<string, any[]> = {};
    for (const st of standings) {
      const g = st.group_name || 'UNASSIGNED';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(st.team_id);
    }

    // Extraer en orden: Todos los 1ros, luego todos los 2dos, luego los 3ros...
    const interleavedTeams = [];
    let maxRank = Math.max(...Object.values(grouped).map(g => g.length));
    
    // Para que los cruces (1A vs 2B) sean más naturales, ordenamos los grupos alfabéticamente
    const groupKeys = Object.keys(grouped).sort();

    for (let rank = 0; rank < maxRank; rank++) {
      for (const gk of groupKeys) {
        if (grouped[gk][rank]) {
          interleavedTeams.push(grouped[gk][rank]);
        }
      }
    }

    if (interleavedTeams.length < teamsCount) throw new Error(`No hay suficientes equipos. Se requieren ${teamsCount}.`);

    topTeams = interleavedTeams.slice(0, teamsCount);
  }

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

    const semi1 = semiData?.find((s: any) => s.bracket_order === 1);
    const semi2 = semiData?.find((s: any) => s.bracket_order === 2);

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

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("format, is_double_round")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) throw new Error("Error obteniendo el torneo.");
  if (tournament.format === 'PLAYOFFS') {
    throw new Error("No se pueden generar partidos de grupos para un torneo de Eliminatoria Directa (Copa).");
  }

  const isDoubleRound = !!tournament.is_double_round;

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
    .select("team_id, group_name")
    .eq("tournament_id", tournamentId);

  if (teamsError || !tournamentTeams) throw new Error("Error obteniendo los equipos del torneo.");
  if (tournamentTeams.length < 3) throw new Error("Se requieren al menos 3 equipos inscritos para generar un fixture automático.");

  // Agrupar equipos por grupo
  const teamsByGroup = tournamentTeams.reduce((acc: any, curr: any) => {
    const groupName = curr.group_name || 'UNASSIGNED';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(curr.team_id);
    return acc;
  }, {});

  const matchesToInsert: any[] = [];
  let maxRoundsGenerated = 0;

  for (const groupName in teamsByGroup) {
    let teams = teamsByGroup[groupName];
    if (teams.length < 2) continue; // No se puede hacer fixture para un grupo de 1

    const hasGhost = teams.length % 2 !== 0;
    if (hasGhost) {
      teams.push("GHOST"); 
    }

    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    if (numRounds > maxRoundsGenerated) maxRoundsGenerated = numRounds;

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
  } // fin del loop de grupos

  if (isDoubleRound) {
    const leg1Length = matchesToInsert.length;
    for (let index = 0; index < leg1Length; index++) {
      const m = matchesToInsert[index];
      matchesToInsert.push({
        tournament_id: tournamentId,
        home_team_id: m.away_team_id,
        away_team_id: m.home_team_id,
        stage: "GROUP",
        is_knockout: false,
        round_number: m.round_number + maxRoundsGenerated,
      });
    }
  }

  const { error: insertError } = await supabase
    .from("matches")
    .insert(matchesToInsert);

  if (insertError) throw new Error("Error al insertar el fixture: " + insertError.message);

  return { 
    success: true, 
    matchesGenerated: matchesToInsert.length, 
    rounds: isDoubleRound ? maxRoundsGenerated * 2 : maxRoundsGenerated 
  };
}
