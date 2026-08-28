import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const orderSchema = json.definitions?.orders || json.components?.schemas?.orders;
  console.log("Orders schema properties:", orderSchema ? Object.keys(orderSchema.properties) : 'Not found');
  console.log("Definitions available:", Object.keys(json.definitions || json.components?.schemas || {}));
}
run();
