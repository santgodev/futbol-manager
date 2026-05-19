const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log("🚀 Iniciando pruebas automatizadas / seeder...");

  // Iniciar sesión como administrador para tener permisos RLS
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@torneo.com',
    password: 'password123'
  });

  if (authError) return console.error("Error autenticando admin:", authError);
  console.log("🔓 Autenticación exitosa (Admin)");

  // 1. Crear Torneo
  const { data: tournament, error: tError } = await supabase
    .from('tournaments')
    .insert({
      slug: 'liga-premier-2026',
      name: 'LIGA PREMIER',
      status: 'Inscripciones abiertas',
      location: 'Madrid, España',
      start_date: '2026-08-01',
      end_date: '2026-12-15',
      admin_name: 'Admin Global'
    })
    .select()
    .single();

  if (tError) return console.error("Error creando torneo:", tError);
  console.log(`✅ Torneo Creado: ${tournament.name}`);

  // 2. Crear Equipos
  const teamsData = [
    { name: 'Real City', logo_url: '' },
    { name: 'Atlético United', logo_url: '' },
    { name: 'Sporting FC', logo_url: '' },
    { name: 'Olympic', logo_url: '' }
  ];

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .insert(teamsData)
    .select();

  if (teamsError) return console.error("Error creando equipos:", teamsError);
  console.log(`✅ Equipos creados: ${teams.length}`);

  // 3. Vincular equipos al torneo (Clasificación)
  const tournamentTeamsData = teams.map((team, index) => ({
    tournament_id: tournament.id,
    team_id: team.id,
    matches_played: index,
    wins: index === 0 ? 1 : 0,
    draws: index > 0 && index < 3 ? 1 : 0,
    losses: index === 3 ? 1 : 0,
    goals_for: index * 2,
    goals_against: index,
    points: index === 0 ? 3 : (index === 3 ? 0 : 1)
  }));

  const { error: ttError } = await supabase.from('tournament_teams').insert(tournamentTeamsData);
  if (ttError) return console.error("Error vinculando equipos:", ttError);
  console.log("✅ Equipos vinculados al torneo correctamente.");

  // 4. Generar Partidos
  const matchesData = [
    {
      tournament_id: tournament.id,
      home_team_id: teams[0].id,
      away_team_id: teams[1].id,
      match_date: '2026-08-05',
      match_time: '18:00:00',
      status: 'PRÓXIMO'
    },
    {
      tournament_id: tournament.id,
      home_team_id: teams[2].id,
      away_team_id: teams[3].id,
      match_date: '2026-08-06',
      match_time: '20:00:00',
      status: 'PRÓXIMO'
    }
  ];

  const { error: matchError } = await supabase.from('matches').insert(matchesData);
  if (matchError) return console.error("Error creando partidos:", matchError);
  console.log("✅ Calendario de partidos generado.");

  // 5. Agregar Jugadores y Goleadores
  const { data: players, error: pError } = await supabase
    .from('players')
    .insert([
      { name: 'Carlos Díaz' },
      { name: 'Andrés López' }
    ])
    .select();

  if (pError) return console.error("Error creando jugadores:", pError);

  const scorersData = [
    { tournament_id: tournament.id, team_id: teams[0].id, player_id: players[0].id, goals: 5 },
    { tournament_id: tournament.id, team_id: teams[1].id, player_id: players[1].id, goals: 3 }
  ];

  await supabase.from('tournament_players').insert(scorersData);
  console.log("✅ Jugadores y estadísticas registradas.");

  console.log("\n🎉 ¡PROCESO AUTOMATIZADO COMPLETADO!");
  console.log(`🔗 Puedes visitar el torneo en: http://localhost:3000/t/${tournament.slug}`);
}

seed();
