export interface Product {
  id: string;
  name: string;
  product_name?: string;
  slug: string;
  category: string;
  price: number;
  mrp: number;
  description: string;
  image: string;
  gallery_images?: string[];
  stock_quantity: number;
  sku?: string;
  active: boolean;
  availability_label: string;
  is_featured: boolean;
  display_order: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateProductInput = Omit<Product, 'created_at' | 'updated_at'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export const PRODUCT_CATEGORIES = [
  'Floral Fragrances',
  'Woody & Traditional',
  'Spiritual & Hawan',
  'Dhoop & Cones',
  'Premium Masala Agarbatti',
  'Gift Sets & Combos'
] as const;

export const AVAILABILITY_LABELS = [
  'Available Now',
  'Coming Soon',
  'Limited Edition',
  'Made to Order',
  'Out of Stock'
] as const;

export type AvailabilityLabel = typeof AVAILABILITY_LABELS[number];

/**
 * Checks if a product has its availability label set to 'Coming Soon'
 */
export function isComingSoon(label?: string | null): boolean {
  if (!label) return false;
  return label.trim().toLowerCase() === 'coming soon';
}

/**
 * Checks if a product is marked as out of stock or has 0 stock quantity
 */
export function isOutOfStock(product: { stock_quantity?: number; availability_label?: string | null }): boolean {
  if (product.availability_label?.trim().toLowerCase() === 'out of stock') return true;
  if (typeof product.stock_quantity === 'number' && product.stock_quantity <= 0) return true;
  return false;
}

/**
 * Validates if a product can be purchased by customers:
 * - Product must be active (visible and enabled)
 * - Product must NOT be 'Coming Soon'
 * - Product must NOT be out of stock (stock_quantity > 0 and availability_label != 'Out of Stock')
 */
export function isProductPurchasable(product?: { active?: boolean; stock_quantity?: number; availability_label?: string | null } | null): boolean {
  if (!product) return false;
  if (product.active === false) return false;
  if (isComingSoon(product.availability_label)) return false;
  if (isOutOfStock(product)) return false;
  return true;
}

