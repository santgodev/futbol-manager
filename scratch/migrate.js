const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fkgtdysbwyinqgkydqsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZ3RkeXNid3lpbnFna3lkcXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODc1NzYsImV4cCI6MjA5NDQ2MzU3Nn0.wCNEKuoXY0i4TkzPgKxumxnA7gHLYsm4qIxbYUkxd5g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { error } = await supabase.rpc('execute_sql', { sql_string: 'ALTER TABLE matches ADD COLUMN IF NOT EXISTS cup_name VARCHAR(100);' });
  if (error) {
    console.error("RPC didn't work (probably doesn't exist). Attempting via a different method.", error.message);
  } else {
    console.log("Success");
  }
}
main();
