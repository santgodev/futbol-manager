const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fkgtdysbwyinqgkydqsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZ3RkeXNid3lpbnFna3lkcXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODc1NzYsImV4cCI6MjA5NDQ2MzU3Nn0.wCNEKuoXY0i4TkzPgKxumxnA7gHLYsm4qIxbYUkxd5g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== TOURNEY DIAGNOSTICS ===');

  // 1. Tournaments
  const { data: tournaments, error: tErr } = await supabase.from('tournaments').select('*');
  if (tErr) return console.error('Tournaments error:', tErr);
  
  console.log(`\nFound ${tournaments.length} Tournaments:`);
  for (const t of tournaments) {
    console.log(`- [${t.id}] "${t.name}" (Slug: ${t.slug}, Status: ${t.status})`);
    
    // 2. Teams in this tournament
    const { data: tTeams } = await supabase.from('tournament_teams').select('*, team:teams(name)').eq('tournament_id', t.id);
    console.log(`  Registered Teams (${tTeams?.length || 0}):`, tTeams?.map(tt => tt.team?.name).join(', '));
    
    // 3. Matches in this tournament
    const { data: tMatches } = await supabase.from('matches').select('*, home:teams!matches_home_team_id_fkey(name), away:teams!matches_away_team_id_fkey(name)').eq('tournament_id', t.id);
    console.log(`  Total Matches (${tMatches?.length || 0}):`);
    const stages = {};
    tMatches?.forEach(m => {
      const homeName = m.home?.name || 'Unknown';
      const awayName = m.away?.name || 'Unknown';
      console.log(`    * [Stage: ${m.stage}, Status: ${m.status}] ${homeName} vs ${awayName} -> Score: ${m.home_score}:${m.away_score} (Knockout: ${m.is_knockout})`);
    });
  }
}

run();
