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
