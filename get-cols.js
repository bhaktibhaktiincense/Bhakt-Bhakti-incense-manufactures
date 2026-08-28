import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const res = await supabase.from('feedback').insert([{
    name: ['array']
  }]);
  console.log("Name type:", res.error);
  
  const r2 = await supabase.from('product_enquiries').insert([{
    id: 'test'
  }]);
  console.log("Inq id type:", r2.error);
}
run();
