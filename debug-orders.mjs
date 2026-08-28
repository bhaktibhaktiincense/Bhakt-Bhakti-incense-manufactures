import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const email = `test_${Date.now()}@example.com`;
  const { data: { user }, error: signUpErr } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (signUpErr) {
    console.error('Sign up failed:', signUpErr);
    return;
  }
  
  console.log('User created:', user.id);

  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    user_id: user.id,
    customer_name: 'Debug User',
    email: email,
    phone: '1234567890',
    shipping_address: 'Debug Address',
    subtotal: 100,
    total: 100,
    status: 'Pending',
    payment_status: 'Pending'
  }).select().single();

  if (orderErr) {
    console.error('Order creation failed:', orderErr);
    return;
  }
  console.log('Order created:', order.id);

  const { data: items, error: itemsErr } = await supabase.from('order_items').insert([{
    order_id: order.id,
    product_id: 'prod_1',
    product_name: 'Test Product',
    price: 100,
    quantity: 1
  }]).select();

  if (itemsErr) {
    console.error('Order items creation failed:', itemsErr);
  } else {
    console.log('Order items inserted:', items);
  }

  const { data: fetch1, error: err1 } = await supabase.from('orders').select('*, order_items(*)').eq('id', order.id).single();
  console.log('Fetch with order_items(*):', JSON.stringify(fetch1, null, 2));
  console.log('Error 1:', err1);
}
run();
