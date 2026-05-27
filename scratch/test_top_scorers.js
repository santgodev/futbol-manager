const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('tournament_top_scorers_view')
    .select('*')
    .eq('tournament_id', '360b57a8-f22d-441b-a9fe-5d3859d91078')
    .limit(3);
  
  if (error) {
    console.error('Error fetching scorers:', error);
  } else {
    console.log('Scorers data:', JSON.stringify(data, null, 2));
  }
}

test();
