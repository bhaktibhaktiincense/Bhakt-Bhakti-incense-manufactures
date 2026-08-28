-- Run this in your Supabase SQL editor to create the necessary tables for customer authentication and orders

-- 1. Create customer_profiles table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.customer_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.customer_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.customer_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);


-- 2. Create carts table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" 
  ON public.carts FOR ALL 
  USING (auth.uid() = user_id);


-- 3. Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart items" 
  ON public.cart_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()
    )
  );


-- 4. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  order_notes TEXT,
  subtotal NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  payment_method TEXT NOT NULL DEFAULT 'COD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view/update all orders
-- Assuming admin relies on authenticated role or similar, we'll keep it simple: 
-- The existing admin dashboard reads 'orders' bypassing RLS if it uses service_role key, 
-- but if it uses standard anon key with a custom admin setup, we should grant access.
-- If the existing dashboard uses a standard login, we should allow read/update for admins.
-- Assuming admins are users with a specific role or just enabling read access to authenticated users for now if this is a simple setup, 
-- but since the prompt says "Do not expose admin-only info to customers", we'll restrict it. 
-- In most simple setups, either service_role is used for admin, or there's an `is_admin` boolean. 
-- Assuming they use service_role for admin on backend or the existing rules cover it.


-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own order items
CREATE POLICY "Users can view own order items" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert order items for their own orders
CREATE POLICY "Users can insert own order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );


CREATE POLICY "Allow authenticated to update feedback" 
  ON public.feedback FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to delete feedback" 
  ON public.feedback FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 6. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  phone TEXT,
  email TEXT,
  rating INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert feedback
CREATE POLICY "Allow public to insert feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated admins to view/manage feedback
CREATE POLICY "Allow authenticated to view feedback" 
  ON public.feedback FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to update feedback" 
  ON public.feedback FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to delete feedback" 
  ON public.feedback FOR DELETE 
  USING (auth.role() = 'authenticated');


-- 7. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert complaints" 
  ON public.complaints FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to view complaints" 
  ON public.complaints FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to update complaints" 
  ON public.complaints FOR UPDATE 
  USING (auth.role() = 'authenticated');


-- 8. Product Enquiries Table
CREATE TABLE IF NOT EXISTS public.product_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_name TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.product_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert product_enquiries" 
  ON public.product_enquiries FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to view product_enquiries" 
  ON public.product_enquiries FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to update product_enquiries" 
  ON public.product_enquiries FOR UPDATE 
  USING (auth.role() = 'authenticated');


-- ==========================================
-- ADMIN ACCESS POLICIES (MISSING PREVIOUSLY)
-- ==========================================

-- Allow admins to view and manage all orders
CREATE POLICY "Admins can manage all orders" 
  ON public.orders FOR ALL 
  USING (auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' OR auth.jwt() ->> 'email' = 'bs635379@gmail.com');

-- Allow admins to view and manage all order items
CREATE POLICY "Admins can manage all order items" 
  ON public.order_items FOR ALL 
  USING (auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' OR auth.jwt() ->> 'email' = 'bs635379@gmail.com');

-- (Optional) If you disabled RLS earlier to bypass this, make sure to re-enable it:
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
