import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Starting insert...");
  const res = await supabase.from('feedback').insert([{
    name: 'Test3',
    rating: 5,
    message: 'Test message 3'
  }]);
  console.log("Result:", res);
}
run();
