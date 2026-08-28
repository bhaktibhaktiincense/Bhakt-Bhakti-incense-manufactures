import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  
  const orderItemsDef = json.definitions.order_items;
  if (orderItemsDef) {
    console.log("order_items columns:", Object.keys(orderItemsDef.properties));
  } else {
    console.log("No order_items definition found in OpenAPI spec");
  }
}
run();
