import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('feedback').insert([{
    name: 'Test',
    phone: '1234567890',
    email: 'test@example.com',
    rating: 5,
    message: 'Test message'
  }]).select();
  console.log("Feedback insert:", { data, error });

  const { data: d2, error: e2 } = await supabase.from('product_enquiries').insert([{
    name: 'Test',
    phone: '1234567890',
    email: 'test@example.com',
    product_name: 'Test',
    message: 'Test message',
    status: 'New'
  }]).select();
  console.log("Enquiries insert:", { data: d2, error: e2 });
}
run();
