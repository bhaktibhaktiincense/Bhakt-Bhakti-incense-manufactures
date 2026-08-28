import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTable(table) {
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) {
    console.log(`Table ${table} error:`, error.code, error.message);
  } else {
    console.log(`Table ${table} exists. Columns:`, data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty table');
    // Try to trigger an error to get column names if empty
    if (data.length === 0) {
      const res = await supabase.from(table).select('non_existent_column_for_schema_discovery').limit(1);
      if (res.error) console.log(`  -> Columns hint: ${res.error.hint || res.error.message}`);
    }
  }
}

async function run() {
  await checkTable('feedback');
  await checkTable('complaints');
  await checkTable('product_enquiries');
  await checkTable('contact_messages');
}
run();
