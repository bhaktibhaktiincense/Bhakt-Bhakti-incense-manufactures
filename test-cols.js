import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('feedback').insert([{
    this_column_does_not_exist: 'test'
  }]);
  console.log("Feedback cols error:", error.hint || error.message);

  const { error: e2 } = await supabase.from('product_enquiries').insert([{
    this_column_does_not_exist: 'test'
  }]);
  console.log("Enquiries cols error:", e2.hint || e2.message);
  
  const { error: e3 } = await supabase.from('complaints').insert([{
    this_column_does_not_exist: 'test'
  }]);
  console.log("Complaints cols error:", e3.hint || e3.message);
}
run();
