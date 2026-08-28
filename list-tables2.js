import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const c1 = await supabase.from('feedback').select('*').limit(1);
  const c2 = await supabase.from('Feedback').select('*').limit(1);
  console.log("lowercase feedback error:", c1.error?.message);
  console.log("uppercase Feedback error:", c2.error?.message);
}
run();
