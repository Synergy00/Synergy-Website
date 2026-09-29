const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data: team } = await supabase.from('teams').select('id').limit(1).single();
  if (!team) return console.log('No team');
  const { error } = await supabase.from('teams').update({ status: 'locked' }).eq('id', team.id);
  console.log('Update Error:', error);
  // revert
  await supabase.from('teams').update({ status: 'round1' }).eq('id', team.id);
}
test();
