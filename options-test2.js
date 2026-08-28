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
  console.log("Headers:");
  res.headers.forEach((v, k) => console.log(`${k}: ${v}`));
}
run();
