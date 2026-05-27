const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fkgtdysbwyinqgkydqsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZ3RkeXNid3lpbnFna3lkcXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODc1NzYsImV4cCI6MjA5NDQ2MzU3Nn0.wCNEKuoXY0i4TkzPgKxumxnA7gHLYsm4qIxbYUkxd5g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== TOURNEY CLEANUP & REPAIR WITH AUTH ===');

  // Authenticate as administrator to have write privileges (RLS bypass)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@torneo.com',
    password: 'password123'
  });

  if (authError) {
    console.error('Error authenticating admin:', authError);
    return;
  }
  console.log('🔓 Authenticated successfully as Admin');

  // 1. Normalize match statuses ('FINAL' / 'FINALIZADO' -> 'FINISHED')
  const { data: updatedMatches, error: updateErr } = await supabase
    .from('matches')
    .update({ status: 'FINISHED' })
    .in('status', ['FINAL', 'FINALIZADO'])
    .select('id, stage, status');
  
  if (updateErr) {
    console.error('Error updating statuses:', updateErr);
  } else {
    console.log(`Normalized ${updatedMatches?.length || 0} matches to status "FINISHED"`);
  }

  // 2. Identify and delete incoherent matches (matches with unregistered teams) for all tournaments
  const { data: tournaments } = await supabase.from('tournaments').select('id, name');
  for (const t of tournaments || []) {
    // Get registered team IDs
    const { data: tTeams } = await supabase.from('tournament_teams').select('team_id').eq('tournament_id', t.id);
    const registeredIds = new Set(tTeams?.map(tt => tt.team_id) || []);
    
    // Get matches
    const { data: tMatches } = await supabase.from('matches').select('*').eq('tournament_id', t.id);
    const matchesToDelete = [];

    for (const m of tMatches || []) {
      // If home_team_id or away_team_id is present but NOT in the registered team IDs, mark for deletion
      const homeValid = !m.home_team_id || registeredIds.has(m.home_team_id);
      const awayValid = !m.away_team_id || registeredIds.has(m.away_team_id);
      
      if (!homeValid || !awayValid) {
        matchesToDelete.push(m.id);
      }
    }

    if (matchesToDelete.length > 0) {
      console.log(`\nTournament "${t.name}" has ${matchesToDelete.length} incoherent matches with unregistered teams.`);
      const { error: delErr } = await supabase.from('matches').delete().in('id', matchesToDelete);
      if (delErr) {
        console.error('Error deleting incoherent matches:', delErr);
      } else {
        console.log(`Successfully deleted ${matchesToDelete.length} incoherent matches.`);
      }
    }
  }

  console.log('\n=== CLEANUP & REPAIR COMPLETED ===');
}

run();
