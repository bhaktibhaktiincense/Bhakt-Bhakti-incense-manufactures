import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const data = await res.json();
  
  const tables = Object.keys(data.definitions);
  console.log("TABLES FOUND:", tables.join(', '));
  
  const targetTables = ['feedback', 'contact_messages', 'product_enquiries', 'complaints', 'orders'];
  
  for (const t of targetTables) {
    if (data.definitions[t]) {
      console.log(`\n--- TABLE: ${t} ---`);
      console.log(Object.keys(data.definitions[t].properties).join(', '));
    }
  }
}
run();
