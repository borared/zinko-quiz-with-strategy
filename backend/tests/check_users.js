require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('users').select('*').limit(5)
  .then(({ data, error }) => {
    if (error) {
      console.error('Error fetching users:', error.message);
    } else {
      console.log('Users in Supabase:', data);
    }
  })
  .catch(e => console.error(e));
