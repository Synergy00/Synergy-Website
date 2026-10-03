
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const email = 'testuser124@example.com';
  const password = 'testpassword124';

  console.log('Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('User already exists, attempting to find user by email to seed profile.');
        // fetch users? not strictly necessary if we just return the known creds, but we might want to insert a profile.
    } else {
        console.error('Error creating auth user:', authError);
        process.exit(1);
    }
  }

  const userId = authData?.user?.id;
  if (!userId) {
    console.error('No user ID returned');
    process.exit(1);
  }

  console.log(`Created user with ID: ${userId}`);
  
  console.log('Creating profile...');
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: 'Test Profile',
    college: 'Test College',
    reg_no: 'TESTREG01',
    branch: 'CSE',
    department: 'CSE',
    section: 'A',
    contact: '+91 9876543210',
    email: email,
    participant_id: `PT-${Math.floor(Math.random() * 10000)}`,
  });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    // Continue anyway
  } else {
    console.log('Profile created successfully.');
  }

  console.log('\n--- Test Profile Credentials ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

seed();
