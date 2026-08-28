import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const id = '11111111-1111-1111-1111-111111111111';
  console.log("Inserting first time...");
  const r1 = await supabase.from('feedback').insert([{
    id,
    name: 'Unique Test',
    rating: 5,
    message: 'Test message'
  }]);
  console.log("R1:", r1);

  console.log("Inserting second time...");
  const r2 = await supabase.from('feedback').insert([{
    id,
    name: 'Unique Test',
    rating: 5,
    message: 'Test message'
  }]);
  console.log("R2:", r2);
}
run();
