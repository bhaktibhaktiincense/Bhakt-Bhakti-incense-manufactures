import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // We can fetch table names using the OpenAPI spec from PostgREST!
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
    headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
  });
  const spec = await res.json();
  console.log("Tables:", Object.keys(spec.paths).filter(p => p !== '/'));
}
run();
