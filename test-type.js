import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('feedback').insert([{
    name: 'Test',
    rating: 'not-a-number', // invalid integer
    message: 'Test message'
  }]);
  console.log("Feedback type error test:", { data, error });
}
run();
