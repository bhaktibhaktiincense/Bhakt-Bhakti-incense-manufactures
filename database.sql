-- =========================================================================
-- BHAKT & BHAKTI INCENSE - COMPLETE SUPABASE DATABASE SCHEMA & MIGRATIONS
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. PRODUCTS TABLE (Dynamic Product Management)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  product_name TEXT,
  slug TEXT UNIQUE,
  category TEXT DEFAULT 'Floral Fragrances',
  price NUMERIC NOT NULL DEFAULT 150,
  mrp NUMERIC DEFAULT 175,
  description TEXT,
  image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 100,
  sku TEXT,
  active BOOLEAN DEFAULT true,
  availability_label TEXT DEFAULT 'Available Now',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  unit TEXT DEFAULT '100g',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- In case products table was created earlier with fewer columns, add them safely:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Floral Fragrances';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 150;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS mrp NUMERIC DEFAULT 175;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS availability_label TEXT DEFAULT 'Available Now';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '100g';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create unique index on slug if not exists
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public visitors can view active products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" 
  ON public.products FOR SELECT 
  USING (active = true);

-- Policy 2: Authenticated admins can view all products (active + inactive)
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" 
  ON public.products FOR SELECT 
  USING (
    auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' 
    OR auth.jwt() ->> 'email' = 'bs635379@gmail.com' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
  );

-- Policy 3: Authenticated admins can insert products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" 
  ON public.products FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' 
    OR auth.jwt() ->> 'email' = 'bs635379@gmail.com' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
  );

-- Policy 4: Authenticated admins can update products
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" 
  ON public.products FOR UPDATE 
  USING (
    auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' 
    OR auth.jwt() ->> 'email' = 'bs635379@gmail.com' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
  );

-- Policy 5: Authenticated admins can delete products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" 
  ON public.products FOR DELETE 
  USING (
    auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' 
    OR auth.jwt() ->> 'email' = 'bs635379@gmail.com' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
  );

-- Seed Authentic Bhakt & Bhakti Incense Products (Preserving existing row)
INSERT INTO public.products (id, name, product_name, slug, category, price, mrp, description, image, stock_quantity, sku, active, availability_label, is_featured, display_order, unit)
VALUES 
  ('rajnigandha', 'Rajnigandha Premium', 'Rajnigandha Premium', 'rajnigandha-premium', 'Floral Fragrances', 150, 175, 'Experience the sweet, floral elegance of the night-blooming tuberose. Handcrafted using traditional masala techniques for long-lasting sacred aroma during puja and meditation.', '/IMG-20260808-WA0005.jpg', 150, 'BB-RAJ-100', true, 'Available Now', true, 1, '100g'),
  ('mogra', 'Mogra Essence', 'Mogra Essence', 'mogra-essence', 'Floral Fragrances', 150, 175, 'The delicate and pure fragrance of Indian Jasmine (Bela). Creates an uplifting, divine ambiance in homes and temples.', '/IMG-20260808-WA0003.jpg', 120, 'BB-MOG-100', true, 'Available Now', true, 2, '100g'),
  ('gulab', 'Gulab (Rose) Premium', 'Gulab (Rose) Premium', 'gulab-premium', 'Floral Fragrances', 150, 175, 'Infused with the timeless aroma of fresh Indian Roses. Calms the mind and invites peace, harmony, and devotional warmth.', '/IMG-20260808-WA0004.jpg', 110, 'BB-GUL-100', true, 'Available Now', true, 3, '100g'),
  ('sandalwood', 'Sandalwood Classic', 'Sandalwood Classic', 'sandalwood-classic', 'Woody & Traditional', 150, 190, 'A timeless classic crafted from rich Mysore sandalwood extracts. Sacred, grounding fragrance revered for deep meditation, prayers, and sacred ceremonies.', '/1777729364289.png', 90, 'BB-SAN-100', true, 'Available Now', true, 4, '100g')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  product_name = EXCLUDED.product_name,
  slug = COALESCE(public.products.slug, EXCLUDED.slug),
  category = COALESCE(public.products.category, EXCLUDED.category),
  price = CASE WHEN public.products.price > 0 THEN public.products.price ELSE EXCLUDED.price END,
  mrp = CASE WHEN public.products.mrp > 0 THEN public.products.mrp ELSE EXCLUDED.mrp END,
  description = COALESCE(public.products.description, EXCLUDED.description),
  image = COALESCE(public.products.image, EXCLUDED.image),
  stock_quantity = COALESCE(public.products.stock_quantity, EXCLUDED.stock_quantity),
  sku = COALESCE(public.products.sku, EXCLUDED.sku),
  active = COALESCE(public.products.active, EXCLUDED.active),
  availability_label = COALESCE(public.products.availability_label, EXCLUDED.availability_label),
  is_featured = COALESCE(public.products.is_featured, EXCLUDED.is_featured),
  display_order = COALESCE(public.products.display_order, EXCLUDED.display_order),
  unit = COALESCE(public.products.unit, EXCLUDED.unit);


-- =========================================================================
-- 2. CUSTOMER PROFILES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.customer_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.customer_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.customer_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);


-- =========================================================================
-- 3. ORDERS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  order_notes TEXT,
  subtotal NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_status TEXT NOT NULL DEFAULT 'Pending (COD)',
  payment_method TEXT NOT NULL DEFAULT 'COD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes TEXT;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow customers and guests to place orders
DROP POLICY IF EXISTS "Allow public and customers to insert orders" ON public.orders;
CREATE POLICY "Allow public and customers to insert orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view and manage all orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" 
  ON public.orders FOR ALL 
  USING (
    auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' 
    OR auth.jwt() ->> 'email' = 'bs635379@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
  );


-- =========================================================================
-- 4. ORDER ITEMS TABLE (Immutable snapshot of ordered products)
-- =========================================================================
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

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public and users to insert order items for their placed orders
DROP POLICY IF EXISTS "Allow public and users to insert order items" ON public.order_items;
CREATE POLICY "Allow public and users to insert order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (true);

-- Customers can view items for their own orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can view and manage all order items
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items" 
  ON public.order_items FOR ALL 
  USING (
    auth.jwt() ->> 'email' = 'bbincensemanufacters@gmail.com' 
    OR auth.jwt() ->> 'email' = 'bs635379@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
  );


-- =========================================================================
-- 5. CARTS & CART ITEMS TABLES (For logged-in cross-device sync)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" 
  ON public.carts FOR ALL 
  USING (auth.uid() = user_id);

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

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" 
  ON public.cart_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()
    )
  );


-- =========================================================================
-- 6. FEEDBACK & COMPLAINTS TABLES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  phone TEXT,
  email TEXT,
  rating INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to view feedback" 
  ON public.feedback FOR SELECT 
  USING (auth.role() = 'authenticated');

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


-- =========================================================================
-- 7. SUPABASE STORAGE SETUP (Product Images Bucket)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public viewing of product images
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow admins and uploads to product images
DROP POLICY IF EXISTS "Admin Manage Product Images" ON storage.objects;
CREATE POLICY "Admin Manage Product Images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');


-- =========================================================================
-- 8. GRANT PRIVILEGES (CRITICAL: Prevents 42501 Permission Denied Errors)
-- =========================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE storage.objects TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE storage.buckets TO postgres, anon, authenticated, service_role;

