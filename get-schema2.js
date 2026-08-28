import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const data = await res.json();
  
  console.log("Top level keys:", Object.keys(data));
  if (data.info) console.log("Info:", data.info);
  
  if (data.paths) {
    const paths = Object.keys(data.paths).filter(p => p.startsWith('/') && !p.includes('{'));
    console.log("\nPossible tables from paths:", paths.join(', '));
  }
}
run();
