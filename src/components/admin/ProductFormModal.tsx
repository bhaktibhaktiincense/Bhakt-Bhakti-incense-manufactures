import React, { useState, useEffect, useRef } from 'react';
import { Product, CreateProductInput, UpdateProductInput, PRODUCT_CATEGORIES, AVAILABILITY_LABELS } from '../../types/product';
import { slugify, uploadProductImage } from '../../services/productService';
import { X, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, AlertCircle, Check } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: CreateProductInput) => Promise<boolean>;
  editingProduct?: Product | null;
  existingProducts?: Product[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  existingProducts = []
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<CreateProductInput>({
    id: '',
    name: '',
    slug: '',
    category: 'Floral Fragrances',
    price: 150,
    mrp: 175,
    description: '',
    image: '',
    gallery_images: [],
    stock_quantity: 100,
    sku: '',
    active: true,
    availability_label: 'Available Now',
    is_featured: false,
    display_order: 1,
    unit: '100g'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        id: editingProduct.id,
        name: editingProduct.name,
        slug: editingProduct.slug || slugify(editingProduct.name),
        category: editingProduct.category || 'Floral Fragrances',
        price: editingProduct.price,
        mrp: editingProduct.mrp || editingProduct.price,
        description: editingProduct.description || '',
        image: editingProduct.image || '',
        gallery_images: editingProduct.gallery_images || (editingProduct.image ? [editingProduct.image] : []),
        stock_quantity: editingProduct.stock_quantity ?? 100,
        sku: editingProduct.sku || '',
        active: editingProduct.active,
        availability_label: editingProduct.availability_label || 'Available Now',
        is_featured: editingProduct.is_featured,
        display_order: editingProduct.display_order ?? 1,
        unit: editingProduct.unit || '100g'
      });
      setCustomCategory(!PRODUCT_CATEGORIES.includes(editingProduct.category as any));
    } else {
      const nextOrder = existingProducts.length > 0
        ? Math.max(...existingProducts.map(p => p.display_order || 0)) + 1
        : 1;
      
      setFormData({
        id: '',
        name: '',
        slug: '',
        category: 'Floral Fragrances',
        price: 150,
        mrp: 175,
        description: '',
        image: '/IMG-20260808-WA0005.jpg',
        gallery_images: ['/IMG-20260808-WA0005.jpg'],
        stock_quantity: 100,
        sku: '',
        active: true,
        availability_label: 'Available Now',
        is_featured: false,
        display_order: nextOrder,
        unit: '100g'
      });
      setCustomCategory(false);
    }
    setErrors({});
  }, [editingProduct, isOpen, existingProducts]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      const newSlug = !editingProduct || !prev.slug || prev.slug === slugify(prev.name) 
        ? slugify(val) 
        : prev.slug;
      const newSku = !prev.sku || prev.sku.startsWith('BB-')
        ? `BB-${val.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD')}-100`
        : prev.sku;

      return {
        ...prev,
        name: val,
        slug: newSlug,
        sku: newSku
      };
    });
  };

  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMain(true);
    setErrors(prev => ({ ...prev, image: '' }));

    const res = await uploadProductImage(files[0]);
    if (res.url) {
      setFormData(prev => ({
        ...prev,
        image: res.url!,
        gallery_images: prev.gallery_images && prev.gallery_images.length > 0 
          ? [res.url!, ...prev.gallery_images.filter(img => img !== res.url)]
          : [res.url!]
      }));
    } else {
      setErrors(prev => ({ ...prev, image: res.error || 'Failed to upload image.' }));
    }
    setUploadingMain(false);
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const res = await uploadProductImage(files[i]);
      if (res.url) {
        newUrls.push(res.url);
      }
    }

    if (newUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        gallery_images: [...(prev.gallery_images || []), ...newUrls]
      }));
    }
    setUploadingGallery(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: (prev.gallery_images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const addGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      gallery_images: [...(prev.gallery_images || []), galleryUrlInput.trim()]
    }));
    setGalleryUrlInput('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    const currentSlug = (formData.slug || slugify(formData.name)).trim();
    if (!currentSlug) {
      newErrors.slug = 'Product slug is required.';
    } else {
      // Check slug uniqueness
      const duplicate = existingProducts.find(
        p => p.slug === currentSlug && p.id !== (editingProduct?.id || formData.id)
      );
      if (duplicate) {
        newErrors.slug = `Slug "${currentSlug}" is already in use by ${duplicate.name}. Please enter a unique slug.`;
      }
    }

    if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Price must be greater than ₹0.';
    }

    if (isNaN(formData.mrp) || formData.mrp < formData.price) {
      newErrors.mrp = 'MRP must be equal to or greater than the selling price.';
    }

    if (isNaN(formData.stock_quantity) || formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative.';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Main product image is required.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalSlug = (formData.slug || slugify(formData.name)).trim();
      const finalId = editingProduct?.id || formData.id || finalSlug;

      const success = await onSave({
        ...formData,
        id: finalId,
        slug: finalSlug,
        price: Number(formData.price),
        mrp: Number(formData.mrp || formData.price),
        stock_quantity: Number(formData.stock_quantity),
        display_order: Number(formData.display_order || 0),
        gallery_images: formData.gallery_images && formData.gallery_images.length > 0 
          ? formData.gallery_images 
          : [formData.image]
      });

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to save product.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-chai-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-espresso-900 text-chai-50 flex items-center justify-between border-b border-espresso-800">
          <div>
            <span className="text-xs uppercase tracking-widest text-marigold-400 font-bold block mb-1">
              {editingProduct ? 'Inventory Management' : 'Catalog Expansion'}
            </span>
            <h2 className="font-serif text-2xl font-bold">
              {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Incense Offering'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-chai-300 hover:text-white hover:bg-espresso-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-kumkum-50 text-kumkum-800 border border-kumkum-200 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Section 1: Basic Product Information */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-espresso-900 font-bold border-b border-chai-200 pb-2">
              1. Basic Identification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajnigandha Premium"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full p-3 bg-chai-50 border rounded-lg text-sm text-espresso-900 focus:bg-white outline-none transition-all ${
                    errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-chai-200 focus:border-marigold-500'
                  }`}
                />
                {errors.name && <span className="text-xs text-red-600 mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider">
                    Product Slug (URL identifier) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, slug: slugify(p.name) }))}
                    className="text-[11px] text-marigold-600 hover:underline font-bold"
                  >
                    Auto-Slug
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="rajnigandha-premium"
                  value={formData.slug}
                  onChange={(e) => setFormData(p => ({ ...p, slug: slugify(e.target.value) }))}
                  className={`w-full p-3 bg-chai-50 border rounded-lg text-sm font-mono text-espresso-900 focus:bg-white outline-none transition-all ${
                    errors.slug ? 'border-red-500 ring-1 ring-red-500' : 'border-chai-200 focus:border-marigold-500'
                  }`}
                />
                {errors.slug && <span className="text-xs text-red-600 mt-1 block">{errors.slug}</span>}
                <span className="text-[10px] text-espresso-500 mt-1 block">Live URL: /product/{formData.slug || 'slug'}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                {!customCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                    >
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setCustomCategory(true)}
                      className="px-3 py-2 bg-chai-100 text-espresso-800 text-xs font-bold rounded-lg border border-chai-200 whitespace-nowrap hover:bg-chai-200"
                    >
                      + Custom
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type custom category"
                      value={formData.category}
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCategory(false)}
                      className="px-3 py-2 bg-chai-100 text-espresso-800 text-xs font-bold rounded-lg border border-chai-200 whitespace-nowrap hover:bg-chai-200"
                    >
                      Presets
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  SKU or Product Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. BB-RAJ-100"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))}
                  className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm font-mono text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Pack Size / Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100g, 250g, 50 sticks"
                  value={formData.unit || '100g'}
                  onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))}
                  className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Catalog Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData(p => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                />
                <span className="text-[10px] text-espresso-500 mt-1 block">Lower numbers appear first on the website (e.g. 1, 2, 3).</span>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-espresso-900 font-bold border-b border-chai-200 pb-2">
              2. Pricing & Stock Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-espresso-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-3 py-3 bg-chai-50 border rounded-lg text-sm text-espresso-900 focus:bg-white outline-none font-bold ${
                      errors.price ? 'border-red-500' : 'border-chai-200 focus:border-marigold-500'
                    }`}
                  />
                </div>
                {errors.price && <span className="text-xs text-red-600 mt-1 block">{errors.price}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Maximum Retail Price MRP (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-espresso-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData(p => ({ ...p, mrp: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-3 py-3 bg-chai-50 border rounded-lg text-sm text-espresso-900 focus:bg-white outline-none ${
                      errors.mrp ? 'border-red-500' : 'border-chai-200 focus:border-marigold-500'
                    }`}
                  />
                </div>
                {errors.mrp && <span className="text-xs text-red-600 mt-1 block">{errors.mrp}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Available Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(p => ({ ...p, stock_quantity: parseInt(e.target.value, 10) || 0 }))}
                  className={`w-full p-3 bg-chai-50 border rounded-lg text-sm text-espresso-900 focus:bg-white outline-none font-bold ${
                    errors.stock_quantity ? 'border-red-500' : 'border-chai-200 focus:border-marigold-500'
                  }`}
                />
                {errors.stock_quantity && <span className="text-xs text-red-600 mt-1 block">{errors.stock_quantity}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Visibility Status
                </label>
                <select
                  value={formData.active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData(p => ({ ...p, active: e.target.value === 'active' }))}
                  className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                >
                  <option value="active">Active (Visible on Website)</option>
                  <option value="inactive">Inactive (Hidden from Public)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                  Availability Label
                </label>
                <select
                  value={formData.availability_label}
                  onChange={(e) => setFormData(p => ({ ...p, availability_label: e.target.value }))}
                  className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:bg-white focus:border-marigold-500 outline-none"
                >
                  {AVAILABILITY_LABELS.map(lbl => (
                    <option key={lbl} value={lbl}>{lbl}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))}
                    className="w-5 h-5 text-marigold-500 rounded border-chai-300 focus:ring-marigold-500"
                  />
                  <div>
                    <span className="font-bold text-espresso-900 text-sm block">Mark as Featured Product</span>
                    <span className="text-[11px] text-espresso-500">Showcases on the Homepage Sacred Collections</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Product Description */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-espresso-900 font-bold border-b border-chai-200 pb-2">
              3. Description & Devotional Notes
            </h3>

            <div>
              <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                Fragrance Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe the aroma notes, floral bouquet, burn characteristics, and sacred puja significance..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className={`w-full p-3 bg-chai-50 border rounded-lg text-sm text-espresso-900 focus:bg-white outline-none ${
                  errors.description ? 'border-red-500' : 'border-chai-200 focus:border-marigold-500'
                }`}
              />
              {errors.description && <span className="text-xs text-red-600 mt-1 block">{errors.description}</span>}
            </div>
          </div>

          {/* Section 4: Image Uploads (Mobile Phone & Desktop) */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-espresso-900 font-bold border-b border-chai-200 pb-2 flex items-center justify-between">
              <span>4. Image Uploads (Mobile & Desktop)</span>
              <span className="text-xs font-normal text-espresso-500">Supports Camera Capture & Gallery</span>
            </h3>

            {/* Main Image Upload */}
            <div className="bg-chai-50 p-4 md:p-5 rounded-xl border border-chai-200 space-y-3">
              <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider">
                Main Showcase Image *
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {formData.image ? (
                  <div className="relative w-28 h-28 bg-white rounded-xl border-2 border-chai-200 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-chai-100 rounded-xl border-2 border-dashed border-chai-300 flex flex-col items-center justify-center text-espresso-400 flex-shrink-0">
                    <ImageIcon size={28} />
                    <span className="text-[10px] mt-1">No Image</span>
                  </div>
                )}

                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      ref={mainFileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleMainFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingMain}
                      onClick={() => mainFileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-espresso-900 text-chai-50 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-espresso-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Upload size={14} />
                      {uploadingMain ? 'Uploading...' : 'Choose from Mobile / PC'}
                    </button>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, image: '' }))}
                        className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs rounded-lg transition-colors font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-espresso-500">
                    Or paste an image URL directly:
                  </div>
                  <input
                    type="text"
                    placeholder="/IMG-20260808-WA0005.jpg or https://..."
                    value={formData.image}
                    onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-chai-200 rounded-lg text-xs font-mono text-espresso-900 outline-none focus:border-marigold-500"
                  />
                  {errors.image && <span className="text-xs text-red-600 block">{errors.image}</span>}
                </div>
              </div>
            </div>

            {/* Multiple Gallery Images */}
            <div className="bg-chai-50 p-4 md:p-5 rounded-xl border border-chai-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider">
                    Additional Gallery Images
                  </label>
                  <span className="text-[11px] text-espresso-500">Upload multiple photos to show packaging, burning stick, or ingredient details.</span>
                </div>
                <input
                  type="file"
                  multiple
                  ref={galleryFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleGalleryFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingGallery}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="px-3 py-2 bg-marigold-500 text-espresso-900 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-marigold-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={14} />
                  {uploadingGallery ? 'Uploading...' : 'Add Images'}
                </button>
              </div>

              {/* Gallery Previews Grid */}
              {formData.gallery_images && formData.gallery_images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {formData.gallery_images.map((img, idx) => (
                    <div key={idx} className="relative group bg-white rounded-lg border border-chai-200 p-1.5 aspect-square flex items-center justify-center">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md opacity-80 group-hover:opacity-100 hover:scale-110 transition-all"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add by URL input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Or enter gallery image URL..."
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  className="flex-1 p-2 bg-white border border-chai-200 rounded-lg text-xs font-mono text-espresso-900 outline-none focus:border-marigold-500"
                />
                <button
                  type="button"
                  onClick={addGalleryUrl}
                  className="px-3 py-2 bg-espresso-900 text-chai-50 text-xs font-bold rounded-lg hover:bg-espresso-800 transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="p-4 bg-chai-100/60 rounded-xl border border-chai-200 flex flex-col sm:flex-row gap-3 justify-end items-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 border border-espresso-300 text-espresso-800 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-marigold-400 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-espresso-900 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
