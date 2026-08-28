import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) {
    console.log("Signup error:", authError);
    return;
  }
  
  console.log("Signed up:", authData.user.id);
  
  const { data, error } = await supabase.from('feedback').select('*').limit(1);
  console.log("Feedback select auth:", { data, error });
  
  const { data: iData, error: iError } = await supabase.from('feedback').insert([{
    name: 'Test Auth',
    phone: '1234567890',
    email: email,
    rating: 5,
    message: 'Test message auth'
  }]).select();
  console.log("Feedback insert auth:", { data: iData, error: iError });
}
run();
