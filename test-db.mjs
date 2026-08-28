import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'bs635379@gmail.com',
    password: 'password123'
  });
  if (authErr) console.log('Auth Error (expected if pwd wrong):', authErr.message);

  const { data: ords } = await supabase.from('orders').select('*, order_items(*)').limit(1);
  console.log('Orders data:', JSON.stringify(ords, null, 2));

  // Let's try service key if anon fails
}
run();
