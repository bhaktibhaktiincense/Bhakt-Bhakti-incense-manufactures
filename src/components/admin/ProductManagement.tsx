import React, { useState, useMemo } from 'react';
import { Product, CreateProductInput, PRODUCT_CATEGORIES } from '../../types/product';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductStatus, 
  toggleProductFeatured, 
  updateProductStock 
} from '../../services/productService';
import ProductFormModal from './ProductFormModal';
import DeleteProductModal from './DeleteProductModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Database, 
  ExternalLink,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ProductManagement({ products, isLoading, onRefresh }: ProductManagementProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'InStock' | 'LowStock' | 'OutOfStock'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Status message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesSlug && !matchesCategory) return false;
      }

      // Category
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }

      // Status
      if (statusFilter === 'Active' && !p.active) return false;
      if (statusFilter === 'Inactive' && p.active) return false;

      // Stock
      if (stockFilter === 'InStock' && (p.stock_quantity <= 0)) return false;
      if (stockFilter === 'LowStock' && (p.stock_quantity <= 0 || p.stock_quantity > 20)) return false;
      if (stockFilter === 'OutOfStock' && (p.stock_quantity > 0)) return false;

      return true;
    }).sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name));
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter]);

  // Statistics Counters
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.active).length;
    const inactive = total - active;
    const featured = products.filter(p => p.is_featured).length;
    const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 20).length;
    const outOfStock = products.filter(p => p.stock_quantity <= 0).length;
    return { total, active, inactive, featured, lowStock, outOfStock };
  }, [products]);

  // Quick Action Handlers
  const handleToggleStatus = async (product: Product) => {
    const nextStatus = !product.active;
    const success = await toggleProductStatus(product.id, nextStatus);
    if (success) {
      showToast(`"${product.name}" is now ${nextStatus ? 'Active on live store' : 'Hidden from store'}.`);
      onRefresh();
    } else {
      showToast('Failed to update status in database.', 'error');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const nextFeatured = !product.is_featured;
    const success = await toggleProductFeatured(product.id, nextFeatured);
    if (success) {
      showToast(`"${product.name}" ${nextFeatured ? 'marked as Featured' : 'removed from Featured'}.`);
      onRefresh();
    } else {
      showToast('Failed to update featured flag.', 'error');
    }
  };

  const handleInlineStockChange = async (product: Product, newStock: number) => {
    if (isNaN(newStock) || newStock < 0) return;
    const success = await updateProductStock(product.id, newStock);
    if (success) {
      showToast(`Updated stock for ${product.name} to ${newStock} units.`);
      onRefresh();
    }
  };

  const handleSaveProduct = async (productData: CreateProductInput): Promise<boolean> => {
    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, productData);
      if (res.product) {
        showToast(`Successfully updated "${res.product.name}".`);
        onRefresh();
        return true;
      } else {
        showToast(res.error || 'Failed to update product.', 'error');
        return false;
      }
    } else {
      const res = await createProduct(productData);
      if (res.product) {
        showToast(`Successfully published "${res.product.name}" to live store.`);
        onRefresh();
        return true;
      } else {
        showToast(res.error || 'Failed to create product.', 'error');
        return false;
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    const res = await deleteProduct(deletingProduct.id);
    setIsDeleting(false);
    if (res.success) {
      showToast(`Deleted "${deletingProduct.name}" from catalog.`);
      setDeletingProduct(null);
      onRefresh();
    } else {
      showToast(res.error || 'Failed to delete product.', 'error');
    }
  };

  const copySqlMigration = () => {
    const sqlScript = `-- =========================================================================
-- BHAKT & BHAKTI INCENSE - COMPLETE SUPABASE ONE-TIME SQL SETUP
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Ensure Columns in public.products
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
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);

-- 2. Grant Schema Privileges (Fixes Error 42501)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Row Level Security on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 4. Supabase Storage Setup for Product Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

GRANT ALL ON TABLE storage.objects TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE storage.buckets TO postgres, anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin Manage Product Images" ON storage.objects;
CREATE POLICY "Admin Manage Product Images" ON storage.objects FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

-- 5. Orders and Order Items Permissions
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
CREATE POLICY "Allow insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select own or admin orders" ON public.orders;
CREATE POLICY "Allow select own or admin orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert order items" ON public.order_items;
CREATE POLICY "Allow insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select order items" ON public.order_items;
CREATE POLICY "Allow select order items" ON public.order_items FOR SELECT USING (true);`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg text-sm font-bold animate-in fade-in slide-in-from-top-4 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-xs uppercase font-bold px-2 py-1 hover:bg-black/5 rounded">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-chai-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-500 block">Total Catalog</span>
          <span className="font-serif text-2xl font-bold text-espresso-900 mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-espresso-400">Offerings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-chai-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Active Live</span>
          <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">{stats.active}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Visible to devotees</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-chai-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-500 block">Inactive / Hidden</span>
          <span className="font-serif text-2xl font-bold text-espresso-700 mt-1 block">{stats.inactive}</span>
          <span className="text-[10px] text-espresso-400">Draft or archived</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-chai-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-marigold-600 block">Featured</span>
          <span className="font-serif text-2xl font-bold text-marigold-700 mt-1 block">{stats.featured}</span>
          <span className="text-[10px] text-marigold-600">Home Showcase</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-chai-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Low Stock (&le;20)</span>
          <span className="font-serif text-2xl font-bold text-amber-700 mt-1 block">{stats.lowStock}</span>
          <span className="text-[10px] text-amber-600">Needs restock</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-chai-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">Out of Stock</span>
          <span className="font-serif text-2xl font-bold text-red-700 mt-1 block">{stats.outOfStock}</span>
          <span className="text-[10px] text-red-500">0 units left</span>
        </div>
      </div>

      {/* Action Header & Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-chai-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl text-espresso-900 font-bold">
              Product Catalog Management
            </h2>
            <span className="bg-chai-100 text-espresso-700 font-mono text-xs px-2.5 py-1 rounded-full font-bold">
              {filteredProducts.length} shown
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="px-3 py-2 border border-chai-300 text-espresso-700 hover:bg-chai-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Supabase Schema Script"
            >
              <Database size={14} className="text-marigold-600" />
              <span>SQL Helper</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsFormModalOpen(true);
              }}
              className="px-5 py-2.5 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-marigold-400 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* SQL Schema Drawer / Helper Banner */}
        {showSqlGuide && (
          <div className="p-4 bg-chai-50 rounded-xl border-2 border-chai-200 text-xs text-espresso-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <Database size={15} className="text-marigold-600" /> Supabase SQL Editor Script
              </span>
              <button
                type="button"
                onClick={copySqlMigration}
                className="px-3 py-1 bg-white border border-chai-300 text-espresso-900 font-bold rounded flex items-center gap-1 hover:bg-chai-100"
              >
                {copiedSql ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-espresso-600">
              Run this in your <strong>Supabase SQL Editor</strong> to ensure all columns (slug, mrp, category, stock_quantity, gallery_images, availability_label, etc.) and Row Level Security policies are fully synchronized.
            </p>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, SKU, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-chai-50 border border-chai-200 rounded-lg text-xs text-espresso-900 outline-none focus:border-marigold-500 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-chai-50 border border-chai-200 rounded-lg text-xs text-espresso-900 outline-none focus:border-marigold-500"
            >
              <option value="All">All Categories</option>
              {PRODUCT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-chai-50 border border-chai-200 rounded-lg text-xs text-espresso-900 outline-none focus:border-marigold-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive / Hidden</option>
            </select>
          </div>

          {/* Stock Filter & View Toggle */}
          <div className="flex gap-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="flex-1 py-2.5 px-3 bg-chai-50 border border-chai-200 rounded-lg text-xs text-espresso-900 outline-none focus:border-marigold-500"
            >
              <option value="All">All Stock</option>
              <option value="InStock">In Stock</option>
              <option value="LowStock">Low Stock (&le;20)</option>
              <option value="OutOfStock">Out of Stock (0)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-chai-200 rounded-lg overflow-hidden bg-chai-50">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-espresso-900 text-marigold-400' : 'text-espresso-600 hover:bg-chai-100'}`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-espresso-900 text-marigold-400' : 'text-espresso-600 hover:bg-chai-100'}`}
                title="Grid Cards View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-chai-200 p-16 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-marigold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-espresso-700 font-serif">Synchronizing product catalog with Supabase...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-chai-200 p-16 text-center shadow-sm">
          <Package size={40} className="mx-auto text-espresso-400 mb-3" />
          <h3 className="font-serif text-xl text-espresso-900 font-bold mb-1">No Products Matched</h3>
          <p className="text-espresso-600 text-xs max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or clear your category and status filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
              setStatusFilter('All');
              setStockFilter('All');
            }}
            className="px-4 py-2 bg-espresso-900 text-chai-50 text-xs font-bold uppercase tracking-wider rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-chai-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-chai-100/80 text-espresso-900 uppercase font-bold tracking-wider border-b border-chai-200">
                  <th className="p-4 w-12 text-center">Order</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category & SKU</th>
                  <th className="p-4">Pricing</th>
                  <th className="p-4">Inventory</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chai-100">
                {filteredProducts.map((p) => {
                  const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-chai-50/50 transition-colors">
                      {/* Display Order */}
                      <td className="p-4 text-center font-mono text-espresso-500 font-bold">
                        #{p.display_order}
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-chai-100 border border-chai-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="font-bold text-espresso-900 text-sm block leading-tight">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-espresso-400 font-mono">
                              /product/{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="p-4">
                        <span className="inline-block bg-chai-100 text-espresso-800 font-medium px-2 py-0.5 rounded text-[11px] mb-1">
                          {p.category}
                        </span>
                        <div className="text-[10px] text-espresso-500 font-mono">
                          {p.sku || 'No SKU'} • {p.unit || '100g'}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif font-bold text-kumkum-600 text-sm">₹{p.price}</span>
                          {p.mrp > p.price && (
                            <span className="text-[10px] text-espresso-400 line-through">₹{p.mrp}</span>
                          )}
                        </div>
                        {discount > 0 && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {discount}% margin
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity & Quick Edit */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={p.stock_quantity}
                            onChange={(e) => handleInlineStockChange(p, parseInt(e.target.value, 10))}
                            className="w-16 p-1.5 bg-chai-50 border border-chai-200 rounded text-center font-bold text-xs focus:bg-white focus:border-marigold-500 outline-none"
                          />
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.stock_quantity > 20 ? 'bg-emerald-100 text-emerald-800' :
                            p.stock_quantity > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.stock_quantity > 20 ? 'In Stock' : p.stock_quantity > 0 ? 'Low Stock' : 'Out'}
                          </span>
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.is_featured 
                              ? 'text-amber-500 hover:text-amber-600 bg-amber-50' 
                              : 'text-espresso-300 hover:text-espresso-600 hover:bg-chai-100'
                          }`}
                          title={p.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <Star size={16} fill={p.is_featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                            p.active 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-espresso-100 text-espresso-700 hover:bg-espresso-200'
                          }`}
                        >
                          {p.active ? (
                            <>
                              <Eye size={12} className="text-emerald-700" /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 text-espresso-700 hover:text-marigold-600 hover:bg-chai-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 text-espresso-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-chai-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-44 bg-chai-100 p-4 relative flex items-center justify-center">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    p.active ? 'bg-emerald-600 text-white' : 'bg-espresso-800 text-chai-100'
                  }`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Featured Star */}
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(p)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${
                    p.is_featured ? 'text-amber-500' : 'text-espresso-400 hover:text-espresso-700'
                  }`}
                >
                  <Star size={16} fill={p.is_featured ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-marigold-600 tracking-wider mb-1">
                  {p.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-espresso-900 mb-1 leading-tight">
                  {p.name}
                </h3>
                <p className="text-[11px] text-espresso-500 font-mono mb-3">
                  SKU: {p.sku || 'N/A'} • {p.unit || '100g'}
                </p>

                <div className="flex justify-between items-baseline pt-2 border-t border-chai-100 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-bold text-kumkum-600 text-xl">₹{p.price}</span>
                    {p.mrp > p.price && (
                      <span className="text-xs text-espresso-400 line-through">₹{p.mrp}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-espresso-800">
                    Stock: {p.stock_quantity}
                  </span>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-chai-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(p);
                      setIsFormModalOpen(true);
                    }}
                    className="py-2 bg-espresso-900 text-chai-50 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-espresso-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProduct(p)}
                    className="py-2 border border-red-300 text-red-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        existingProducts={products}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        product={deletingProduct}
        isDeleting={isDeleting}
      />
    </div>
  );
}
