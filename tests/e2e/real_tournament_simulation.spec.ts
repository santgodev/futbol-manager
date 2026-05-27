import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Simulación de Torneo Real - Copa E2E', () => {
  let supabase: any;
  let tournamentId: string;
  let teamAId: string;
  let teamBId: string;
  let playerAId: string;
  let playerBId: string;
  let matchId: string;

  // 1. Sembrado de datos realistas en la base de datos antes de las pruebas
  test.beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Autenticar cliente de Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@torneo.com',
      password: 'password123'
    });

    if (authError || !authData.user) {
      throw new Error('Fallo al autenticar cliente de Supabase para seeder: ' + authError?.message);
    }

    const adminUserId = authData.user.id;

    // Crear Torneo de prueba
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .insert({
        name: 'COPA PLAYWRIGHT REAL LIFE',
        slug: 'copa-playwright-real-life-' + Date.now(),
        status: 'EN CURSO',
        location: 'Bogotá, Colombia',
        category: 'Adultos',
        format: 'GROUPS_AND_PLAYOFFS',
        created_by: adminUserId
      })
      .select().single();

    if (tErr || !tournament) throw new Error('Error al crear torneo: ' + tErr?.message);
    tournamentId = tournament.id;

    // Crear Equipos
    const { data: teamA, error: taErr } = await supabase
      .from('teams')
      .insert({ name: 'E2E DRAGONS FC', created_by: adminUserId })
      .select().single();
    if (taErr || !teamA) throw new Error('Error al crear Equipo A');
    teamAId = teamA.id;

    const { data: teamB, error: tbErr } = await supabase
      .from('teams')
      .insert({ name: 'E2E SHARKS FC', created_by: adminUserId })
      .select().single();
    if (tbErr || !teamB) throw new Error('Error al crear Equipo B');
    teamBId = teamB.id;

    // Vincular Equipos al Torneo
    await supabase.from('tournament_teams').insert([
      { tournament_id: tournamentId, team_id: teamAId },
      { tournament_id: tournamentId, team_id: teamBId }
    ]);

    // Crear Jugadores con team_id asignado para que aparezcan en los rosters
    const { data: playerA, error: paErr } = await supabase
      .from('players')
      .insert({ name: 'Goleador Dragons', team_id: teamAId, number: 10, created_by: adminUserId, is_active: true })
      .select().single();
    if (paErr || !playerA) throw new Error('Error al crear Jugador A: ' + paErr?.message);
    playerAId = playerA.id;

    const { data: playerB, error: pbErr } = await supabase
      .from('players')
      .insert({ name: 'Portero Sharks', team_id: teamBId, number: 1, created_by: adminUserId, is_active: true })
      .select().single();
    if (pbErr || !playerB) throw new Error('Error al crear Jugador B');
    playerBId = playerB.id;

    // Registrar en nómina del torneo
    await supabase.from('tournament_players').insert([
      { tournament_id: tournamentId, player_id: playerAId, team_id: teamAId, goals: 0 },
      { tournament_id: tournamentId, player_id: playerBId, team_id: teamBId, goals: 0 }
    ]);

    // Crear un partido agendado (Fase de Grupos)
    const { data: match, error: mErr } = await supabase
      .from('matches')
      .insert({
        tournament_id: tournamentId,
        home_team_id: teamAId,
        away_team_id: teamBId,
        stage: 'GROUP',
        is_knockout: false,
        round_number: 1,
        status: 'SCHEDULED',
        version: 1
      })
      .select().single();

    if (mErr || !match) throw new Error('Error al crear Partido: ' + mErr?.message);
    matchId = match.id;
  });

  // 2. Limpieza de datos en cascada después de la simulación
  test.afterAll(async () => {
    if (supabase) {
      if (matchId) {
        await supabase.from('match_events').delete().eq('match_id', matchId);
        await supabase.from('matches').delete().eq('id', matchId);
      }
      if (playerAId) {
        await supabase.from('tournament_players').delete().eq('player_id', playerAId);
        await supabase.from('players').delete().eq('id', playerAId);
      }
      if (playerBId) {
        await supabase.from('tournament_players').delete().eq('player_id', playerBId);
        await supabase.from('players').delete().eq('id', playerBId);
      }
      if (tournamentId) {
        await supabase.from('tournament_teams').delete().eq('tournament_id', tournamentId);
        await supabase.from('tournaments').delete().eq('id', tournamentId);
      }
      if (teamAId) await supabase.from('teams').delete().eq('id', teamAId);
      if (teamBId) await supabase.from('teams').delete().eq('id', teamBId);
    }
  });

  // 3. Flujo de simulación interactiva con Playwright
  test('debe simular un partido completo: registrar alineaciones, anotar gol, finalizar y recalcular estadísticas', async ({ page }) => {
    // A. Iniciar sesión como administrador
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@torneo.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    // B. Ir a los detalles del torneo sembrado
    await page.goto(`/admin/tournaments/${tournamentId}`);

    // Verificar presencia de los equipos inscritos en la sección correspondiente (evitando dropdowns con opciones ocultas)
    const teamsSection = page.locator('section:has-text("Equipos Participantes")').first();
    await expect(teamsSection.getByText('E2E DRAGONS FC', { exact: true }).first()).toBeVisible();
    await expect(teamsSection.getByText('E2E SHARKS FC', { exact: true }).first()).toBeVisible();

    // C. Entrar al Control Room del partido
    // Usamos el rol de link para mayor robustez ante slash normalizations del router
    const controlRoomLink = page.getByRole('link', { name: 'Control Room' }).first();
    await expect(controlRoomLink).toBeVisible();
    await controlRoomLink.click();

    // Esperar redirección al Control Room en vivo
    // Aumentamos el timeout a 30 segundos porque en Windows la compilación de desarrollo del nuevo route
    // por parte del dev server de Next.js en la primera visita puede tomar más de 10 segundos.
    await page.waitForURL(/\/admin\/match-room/, { timeout: 30000 });
    await expect(page.getByText('EN VIVO')).toBeVisible({ timeout: 30000 });

    // Asegurar que Next.js haya compilado y React esté totalmente hidratado
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 2 segundos de gracia para hidratación de React

    // D. Registrar un gol para Goleador Dragons (Local)
    // Hacer clic sobre el jugador en la plantilla
    const playerAButton = page.getByText('Goleador Dragons', { exact: true }).first();
    await expect(playerAButton).toBeVisible();
    await playerAButton.click();

    // Registrar gol
    const goalBtn = page.getByText('Anotar Gol', { exact: true });
    await expect(goalBtn).toBeVisible();
    await goalBtn.click();

    // Esperar a que el marcador se actualice a 1 - 0 en la interfaz
    const scoreText = page.locator('span.tabular-nums').first();
    await expect(scoreText).toHaveText('1');

    // E. Finalizar el partido oficialmente
    // Playwright intercepta el diálogo confirm() y lo acepta automáticamente
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    const finalizeBtn = page.getByText('Finalizar Partido', { exact: true });
    await expect(finalizeBtn).toBeVisible();
    await finalizeBtn.click();

    // F. Validar estadísticas recalculadas en los detalles del torneo
    await page.waitForURL(new RegExp(`/admin/tournaments/${tournamentId}`), { timeout: 30000 });

    // 1. Tabla de Clasificaciones: E2E DRAGONS FC debe liderar con 3 puntos
    const dragonsRow = page.locator('tr:has-text("E2E DRAGONS FC")').first();
    await expect(dragonsRow).toBeVisible();
    // Puntos (PTS) es la última celda de la fila en la tabla
    const pointsCell = dragonsRow.locator('td').last();
    await expect(pointsCell).toHaveText('3');

    // 2. Goleadores: Goleador Dragons debe aparecer con 1 gol
    const topScorersSection = page.locator('section:has-text("Top Goleadores")').first();
    await expect(topScorersSection).toBeVisible();
    await expect(topScorersSection.getByText('Goleador Dragons').first()).toBeVisible();
    await expect(topScorersSection.getByText('1', { exact: true }).first()).toBeVisible();
  });
});
