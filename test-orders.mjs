import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { user }, error: authErr } = await supabase.auth.signUp({
    email: 'test_invoice@gmail.com',
    password: 'password123'
  });
  
  if (authErr && authErr.message !== 'User already registered') {
     console.log('Signup err:', authErr);
  }
  
  await supabase.auth.signInWithPassword({
    email: 'test_invoice@gmail.com',
    password: 'password123'
  });

  const uid = (await supabase.auth.getUser()).data.user.id;

  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    user_id: uid,
    customer_name: 'Test Customer',
    email: 'test@gmail.com',
    phone: '1234567890',
    shipping_address: '123 Test St',
    subtotal: 100,
    total: 100,
    status: 'Pending',
    payment_status: 'Pending'
  }).select().single();

  if(orderErr) {
     console.log('Order created error:', orderErr);
     return;
  }
  console.log('Order created:', order.id);

  const { error: itemsErr } = await supabase.from('order_items').insert([{
    order_id: order.id,
    product_id: 'prod_1',
    product_name: 'Test Product',
    price: 100,
    quantity: 1
  }]);
  
  console.log('Items inserted:', itemsErr || 'success');

  const { data: ords } = await supabase.from('orders').select('*, order_items(*)').eq('id', order.id);
  console.log('Nested select result:', JSON.stringify(ords, null, 2));
}
run();
