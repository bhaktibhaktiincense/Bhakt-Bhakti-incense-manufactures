import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const f = await supabase.from('Feedback').select('*').limit(1);
  console.log("Feedback:", f.error ? f.error.message : "Success");
  const p = await supabase.from('Product_Enquiries').select('*').limit(1);
  console.log("Product_Enquiries:", p.error ? p.error.message : "Success");
  const c = await supabase.from('Complaints').select('*').limit(1);
  console.log("Complaints:", c.error ? c.error.message : "Success");
}
run();
