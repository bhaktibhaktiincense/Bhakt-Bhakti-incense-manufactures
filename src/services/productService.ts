import { supabase } from '../lib/supabase';
import { Product, CreateProductInput, UpdateProductInput } from '../types/product';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "rajnigandha",
    name: "Rajnigandha Premium",
    product_name: "Rajnigandha Premium",
    slug: "rajnigandha-premium",
    category: "Floral Fragrances",
    price: 150,
    mrp: 175,
    description: "Experience the sweet, floral elegance of the night-blooming tuberose. Handcrafted using traditional masala techniques for long-lasting sacred aroma during puja, meditation, and devotional gatherings.",
    image: "/IMG-20260808-WA0005.jpg",
    gallery_images: [
      "/IMG-20260808-WA0005.jpg",
      "/IMG20260819113521.jpg"
    ],
    stock_quantity: 150,
    sku: "BB-RAJ-100",
    active: true,
    availability_label: "Available Now",
    is_featured: true,
    display_order: 1,
    unit: "100g"
  },
  {
    id: "mogra",
    name: "Mogra Essence",
    product_name: "Mogra Essence",
    slug: "mogra-essence",
    category: "Floral Fragrances",
    price: 150,
    mrp: 175,
    description: "The delicate and pure fragrance of Indian Jasmine (Bela). Creates an uplifting, tranquil ambiance in homes and temples, purifying the aura and calming restless thoughts.",
    image: "/IMG-20260808-WA0003.jpg",
    gallery_images: [
      "/IMG-20260808-WA0003.jpg"
    ],
    stock_quantity: 120,
    sku: "BB-MOG-100",
    active: true,
    availability_label: "Available Now",
    is_featured: true,
    display_order: 2,
    unit: "100g"
  },
  {
    id: "gulab",
    name: "Gulab (Rose) Premium",
    product_name: "Gulab (Rose) Premium",
    slug: "gulab-premium",
    category: "Floral Fragrances",
    price: 150,
    mrp: 175,
    description: "Infused with the timeless aroma of fresh Indian Desi Roses. Calms the mind and invites peace, harmony, and devotional warmth into every sacred space.",
    image: "/IMG-20260808-WA0004.jpg",
    gallery_images: [
      "/IMG-20260808-WA0004.jpg"
    ],
    stock_quantity: 110,
    sku: "BB-GUL-100",
    active: true,
    availability_label: "Available Now",
    is_featured: true,
    display_order: 3,
    unit: "100g"
  },
  {
    id: "sandalwood",
    name: "Sandalwood Classic",
    product_name: "Sandalwood Classic",
    slug: "sandalwood-classic",
    category: "Woody & Traditional",
    price: 150,
    mrp: 190,
    description: "A timeless classic crafted from rich sandalwood extracts. Sacred, grounding fragrance revered for centuries in Indian tradition for deep meditation, daily prayer, and positive energy.",
    image: "/1777729364289.png",
    gallery_images: [
      "/1777729364289.png"
    ],
    stock_quantity: 90,
    sku: "BB-SAN-100",
    active: true,
    availability_label: "Available Now",
    is_featured: true,
    display_order: 4,
    unit: "100g"
  }
];

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Normalizes a raw DB row to our standard Product model
 */
function normalizeProduct(row: any): Product {
  const name = row.name || row.product_name || 'Incense Product';
  const defaultSlug = slugify(name);
  const defaultItem = DEFAULT_PRODUCTS.find(p => p.id === row.id || p.slug === (row.slug || defaultSlug));

  return {
    id: String(row.id || defaultSlug),
    name: name,
    product_name: row.product_name || name,
    slug: row.slug || defaultItem?.slug || defaultSlug,
    category: row.category || defaultItem?.category || 'Floral Fragrances',
    price: typeof row.price === 'number' && row.price > 0 ? row.price : (defaultItem?.price || 150),
    mrp: typeof row.mrp === 'number' && row.mrp > 0 ? row.mrp : (defaultItem?.mrp || 175),
    description: row.description || row.desc || defaultItem?.description || '',
    image: row.image || defaultItem?.image || '/IMG-20260808-WA0005.jpg',
    gallery_images: Array.isArray(row.gallery_images) && row.gallery_images.length > 0 
      ? row.gallery_images 
      : (defaultItem?.gallery_images || [row.image || '/IMG-20260808-WA0005.jpg']),
    stock_quantity: typeof row.stock_quantity === 'number' ? row.stock_quantity : (defaultItem?.stock_quantity ?? 100),
    sku: row.sku || defaultItem?.sku || `BB-${name.slice(0, 3).toUpperCase()}-100`,
    active: row.active !== undefined ? Boolean(row.active) : true,
    availability_label: row.availability_label || (row.active ? 'Available Now' : 'Coming Soon'),
    is_featured: row.is_featured !== undefined ? Boolean(row.is_featured) : Boolean(defaultItem?.is_featured),
    display_order: typeof row.display_order === 'number' ? row.display_order : (defaultItem?.display_order || 99),
    unit: row.unit || defaultItem?.unit || '100g',
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Fetch all products from Supabase with fallback to default catalog
 */
export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*');
    if (!includeInactive) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query;

    if (error) {
      console.warn('Supabase products fetch note:', error.message);
      // Try fetching from server fallback API
      try {
        const sRes = await fetch(`/api/products?includeInactive=${includeInactive}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          if (Array.isArray(sData) && sData.length > 0) {
            return sData.map(normalizeProduct).sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name));
          }
        }
      } catch {
        // ignore server fallback error
      }

      // Emergency fallback only on total network failure
      return includeInactive 
        ? DEFAULT_PRODUCTS 
        : DEFAULT_PRODUCTS.filter(p => p.active);
    }

    if (!data || data.length === 0) {
      // Table is empty or no matching rows
      if (includeInactive) {
        return DEFAULT_PRODUCTS;
      }
      return [];
    }

    // Database is authoritative: map directly to our Product model
    const normalized = data.map(normalizeProduct);

    // Filter inactive items if includeInactive is false (safeguard)
    const filtered = includeInactive ? normalized : normalized.filter(p => p.active);

    // Sort by display_order ascending, then by name
    return filtered.sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error fetching products:', err);
    return includeInactive ? DEFAULT_PRODUCTS : DEFAULT_PRODUCTS.filter(p => p.active);
  }
}

/**
 * Fetch a single product by slug or id
 */
export async function fetchProductBySlug(slugOrId: string): Promise<Product | null> {
  const all = await fetchProducts(true);
  const found = all.find(p => p.slug === slugOrId || p.id === slugOrId);
  return found || null;
}

/**
 * Save / Create Product in Supabase (with server sync fallback)
 */
export async function createProduct(input: CreateProductInput): Promise<{ product: Product | null; error?: string }> {
  try {
    const slug = input.slug || slugify(input.name);
    const id = input.id || slug;
    
    const payload: any = {
      id,
      name: input.name,
      product_name: input.name,
      slug,
      category: input.category || 'Floral Fragrances',
      price: Number(input.price),
      mrp: Number(input.mrp || input.price),
      description: input.description,
      image: input.image,
      gallery_images: input.gallery_images && input.gallery_images.length > 0 ? input.gallery_images : [input.image],
      stock_quantity: Number(input.stock_quantity ?? 100),
      sku: input.sku || `BB-${input.name.slice(0, 3).toUpperCase()}-100`,
      active: input.active !== undefined ? input.active : true,
      availability_label: input.availability_label || (input.active ? 'Available Now' : 'Coming Soon'),
      is_featured: Boolean(input.is_featured),
      display_order: Number(input.display_order || 0),
      unit: input.unit || '100g',
      updated_at: new Date().toISOString()
    };

    let data: any = null;

    // 1. Try direct Supabase insertion
    const directResult = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (!directResult.error && directResult.data) {
      data = directResult.data;
    } else {
      console.warn('Direct Supabase insert note:', directResult.error?.message);
      // Try through server API endpoint
      const sRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (sRes.ok) {
        const sJson = await sRes.json();
        data = sJson.product || payload;
      } else {
        const errJson = await sRes.json().catch(() => ({}));
        throw new Error(errJson.error || directResult.error?.message || 'Failed to create product in database');
      }
    }

    const created = normalizeProduct(data || payload);
    notifyProductsChanged();
    return { product: created };
  } catch (err: any) {
    console.error('Failed to create product:', err);
    return { product: null, error: err.message || 'Failed to create product' };
  }
}

/**
 * Update an existing Product
 */
export async function updateProduct(id: string, updates: UpdateProductInput): Promise<{ product: Product | null; error?: string }> {
  try {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.name && !updates.product_name) {
      payload.product_name = updates.name;
    }
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.mrp !== undefined) payload.mrp = Number(updates.mrp);
    if (updates.stock_quantity !== undefined) payload.stock_quantity = Number(updates.stock_quantity);
    if (updates.display_order !== undefined) payload.display_order = Number(updates.display_order);

    let data: any = null;

    // 1. Try direct Supabase update
    const directResult = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!directResult.error && directResult.data) {
      data = directResult.data;
    } else {
      console.warn('Direct Supabase update note:', directResult.error?.message);
      // Try through server API endpoint
      const sRes = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (sRes.ok) {
        const sJson = await sRes.json();
        data = sJson.product || { id, ...payload };
      } else {
        const errJson = await sRes.json().catch(() => ({}));
        throw new Error(errJson.error || directResult.error?.message || 'Failed to update product in database');
      }
    }

    const updated = normalizeProduct(data || { id, ...updates });
    notifyProductsChanged();
    return { product: updated };
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return { product: null, error: err.message || 'Failed to update product' };
  }
}

/**
 * Delete a product with confirmation
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const directResult = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (directResult.error) {
      console.warn('Direct Supabase delete note:', directResult.error.message);
      const sRes = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!sRes.ok) {
        const errJson = await sRes.json().catch(() => ({}));
        throw new Error(errJson.error || directResult.error.message);
      }
    }
    notifyProductsChanged();
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    return { success: false, error: err.message || 'Failed to delete product' };
  }
}

/**
 * Quick toggle for Active/Inactive status
 */
export async function toggleProductStatus(id: string, active: boolean): Promise<boolean> {
  const res = await updateProduct(id, { active });
  return Boolean(res.product);
}

/**
 * Quick toggle for Featured status
 */
export async function toggleProductFeatured(id: string, is_featured: boolean): Promise<boolean> {
  const res = await updateProduct(id, { is_featured });
  return Boolean(res.product);
}

/**
 * Quick update for stock quantity (preserves existing availability label unless specified or zero stock)
 */
export async function updateProductStock(id: string, stock_quantity: number, availability_label?: string): Promise<boolean> {
  const updates: UpdateProductInput = { stock_quantity };
  if (availability_label) {
    updates.availability_label = availability_label;
  } else if (stock_quantity === 0) {
    updates.availability_label = 'Out of Stock';
  }
  const res = await updateProduct(id, updates);
  return Boolean(res.product);
}

/**
 * Quick update for availability label (e.g. 'Available Now', 'Coming Soon', 'Out of Stock')
 * Directly persists to database and triggers live update across website
 */
export async function updateProductAvailability(id: string, availability_label: string): Promise<boolean> {
  const res = await updateProduct(id, { availability_label });
  return Boolean(res.product);
}


/**
 * Upload an image using the server endpoint (supporting mobile devices and Supabase Storage)
 */
export async function uploadProductImage(file: File): Promise<{ url: string | null; error?: string }> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return { url: null, error: 'Please upload a valid image (JPEG, PNG, or WebP format).' };
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'Image file size must be less than 5MB.' };
  }

  try {
    // 1. Try uploading to Supabase Storage first if user has session
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return { url: publicUrlData.publicUrl };
      }
    }

    // 2. Fallback to server endpoint
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              filetype: file.type,
              dataUrl: reader.result
            })
          });
          const result = await res.json();
          if (res.ok && result.url) {
            resolve({ url: result.url });
          } else {
            // Last-mile fallback: use dataURL directly so UI is never blocked
            resolve({ url: reader.result as string });
          }
        } catch {
          resolve({ url: reader.result as string });
        }
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Failed to read image file.' });
      };
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { url: null, error: err.message || 'Image upload failed' };
  }
}

/**
 * Dispatch event to notify components across the app to refetch products
 */
export function notifyProductsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bhakt_products_changed'));
  }
}
