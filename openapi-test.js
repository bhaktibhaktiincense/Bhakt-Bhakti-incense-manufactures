import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/';
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Accept': 'application/openapi+json'
    }
  });
  const data = await res.json();
  const tables = Object.keys(data.definitions || {});
  console.log("Tables:", tables.join(', '));
  if (data.definitions && data.definitions.feedback) {
    console.log("Feedback columns:", Object.keys(data.definitions.feedback.properties).join(', '));
  }
  if (data.definitions && data.definitions.product_enquiries) {
    console.log("Enquiries columns:", Object.keys(data.definitions.product_enquiries.properties).join(', '));
  }
}
run();
