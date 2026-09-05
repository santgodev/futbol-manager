const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fkgtdysbwyinqgkydqsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZ3RkeXNid3lpbnFna3lkcXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODc1NzYsImV4cCI6MjA5NDQ2MzU3Nn0.wCNEKuoXY0i4TkzPgKxumxnA7gHLYsm4qIxbYUkxd5g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('matches').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log(Object.keys(data[0] || {}));
  }
}
main();
