const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data: team } = await supabase.from('teams').select('id, problem_statement_id').limit(1).single();
  if (!team) return console.log('No team');
  const { error } = await supabase.from('teams').update({ problem_statement_id: team.problem_statement_id + '_LOCKED' }).eq('id', team.id);
  console.log('Update Error:', error);
  // revert
  await supabase.from('teams').update({ problem_statement_id: team.problem_statement_id }).eq('id', team.id);
}
test();
