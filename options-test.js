import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/feedback';
  const res = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY
    }
  });
  const text = await res.text();
  console.log("OPTIONS feedback:", text);
}
run();
