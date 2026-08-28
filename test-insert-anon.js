import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.log("Inserting feedback anonymously...");
  const { data, error, status } = await supabase.from('feedback').insert([{
    name: 'Test Final',
    phone: '12345',
    email: 'test@example.com',
    rating: 5,
    message: 'Test Final Message'
  }]);
  console.log("Feedback insert result:", { error, status });
  
  console.log("Inserting product inquiry anonymously...");
  const p = await supabase.from('product_enquiries').insert([{
    name: 'Test Final B2B',
    phone: '12345',
    message: 'Test Final B2B',
    status: 'New'
  }]);
  console.log("Inquiry insert result:", { error: p.error, status: p.status });
}
run();
