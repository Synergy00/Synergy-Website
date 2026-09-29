const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data: team, error } = await supabase.from('teams').select('*').limit(1).single();
  if (team) console.log(Object.keys(team));
  else console.log(error);
}
test();
