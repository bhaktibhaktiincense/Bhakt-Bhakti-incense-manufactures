import { useSEO } from '../hooks/useSEO';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../hooks/useProducts';
import { ShoppingCart, Eye, Sparkles, Filter, Check, Clock } from 'lucide-react';
import { PRODUCT_CATEGORIES, isComingSoon, isProductPurchasable, isOutOfStock } from '../types/product';
import { trackProductClick } from '../utils/analytics';

export default function Products() {
  useSEO({
    title: "Our Incense Products",
    description: "Explore our premium collection of handcrafted incense sticks. Shop natural, soothing fragrances for devotion and meditation.",
    path: "/products"
  });

  const { addToCart } = useCart();
  const { products, loading } = useProducts(false); // active products only
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleAdd = async (prod: any) => {
    if (!isProductPurchasable(prod)) return;
    const res = await addToCart({
      product_id: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: 1,
      image: prod.image,
      availability_label: prod.availability_label
    });
    if (res?.success) {
      setJustAddedId(prod.id);
      setTimeout(() => setJustAddedId(null), 2500);
    }
  };

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      {/* Sacred Offerings Header Banner */}
      <section className="bg-espresso-900 py-20 text-chai-50 text-center px-6 relative border-b-4 border-kumkum-600">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4ac0d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-marigold-500/10 border border-marigold-500/30 text-marigold-400 text-xs uppercase tracking-widest font-bold mb-4">
            <Sparkles size={14} /> Traditional Handcrafted Agarbatti
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-marigold-400">Our Sacred Offerings</h1>
          <p className="text-chai-200 tracking-wide text-base md:text-lg">
            Premium fragrances crafted with pure natural raw materials, flowers, and essential oils for every moment of prayer and meditation.
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="container mx-auto px-6 lg:px-12 pt-10">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === 'All'
                ? 'bg-espresso-900 text-marigold-400 shadow-md'
                : 'bg-white text-espresso-700 hover:bg-chai-100 border border-chai-200'
            }`}
          >
            All Collections ({products.length})
          </button>
          {PRODUCT_CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-espresso-900 text-marigold-400 shadow-md'
                    : 'bg-white text-espresso-700 hover:bg-chai-100 border border-chai-200'
                }`}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 container mx-auto px-6 lg:px-12">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-marigold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-espresso-600 font-serif text-lg">Fetching fresh incense collections...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-chai-200 max-w-md mx-auto p-8">
            <p className="text-espresso-800 font-serif text-xl mb-2">No products found in this category.</p>
            <p className="text-espresso-600 text-sm mb-4">Please check other categories or explore all collections.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-6 py-2.5 bg-espresso-900 text-chai-50 text-xs uppercase tracking-wider font-bold rounded"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((prod) => {
              const isComingSoonProd = isComingSoon(prod.availability_label);
              const isOutStock = isOutOfStock(prod);
              const purchasable = isProductPurchasable(prod);
              const discountPercent = prod.mrp > prod.price 
                ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) 
                : 0;

              return (
                <motion.div 
                  key={prod.id}
                  whileHover={{ y: -6 }}
                  className={`bg-chai-50 rounded-t-[100px] overflow-hidden shadow-xl transition-all duration-300 border-b-4 flex flex-col ${
                    purchasable 
                      ? 'border-kumkum-600 group' 
                      : isComingSoonProd 
                      ? 'border-amber-500 group' 
                      : 'border-espresso-700 opacity-80'
                  }`}
                >
                  {/* Arched Photo Showcase */}
                  <div className="h-64 md:h-72 overflow-hidden relative p-4 pt-6 bg-chai-100 flex items-center justify-center">
                    <Link 
                      to={`/product/${prod.slug || prod.id}`} 
                      onClick={() => trackProductClick(prod.id, prod.name)}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={prod.image} 
                        alt={`Bhakt & Bhakti ${prod.name} Incense Sticks`} 
                        className={`w-full h-full object-contain transition-transform duration-700 ${
                          purchasable ? 'group-hover:scale-105' : isComingSoonProd ? 'group-hover:scale-102' : 'opacity-60 mix-blend-luminosity'
                        }`} 
                      />
                    </Link>

                    {/* Availability Badge */}
                    <div className="absolute top-6 right-6">
                      <span className={`text-[10px] md:text-xs px-3 py-1 uppercase tracking-widest font-bold rounded-full shadow-md ${
                        isComingSoonProd
                          ? 'bg-amber-600 text-white'
                          : isOutStock
                          ? 'bg-red-700 text-white'
                          : 'bg-kumkum-600 text-chai-50'
                      }`}>
                        {isComingSoonProd ? 'Coming Soon' : isOutStock ? 'Out of Stock' : (prod.availability_label || 'Available Now')}
                      </span>
                    </div>

                    {/* Discount badge */}
                    {discountPercent > 0 && !isComingSoonProd && !isOutStock && (
                      <div className="absolute top-6 left-6 bg-marigold-500 text-espresso-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {discountPercent}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-6 pt-5 text-center flex-1 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-marigold-600 tracking-wider mb-1 block">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-2xl mb-2 text-espresso-900 font-bold">
                      <Link 
                        to={`/product/${prod.slug || prod.id}`} 
                        onClick={() => trackProductClick(prod.id, prod.name)}
                        className="hover:text-kumkum-600 transition-colors"
                      >
                        {prod.name}
                      </Link>
                    </h3>
                    <p className="text-espresso-700 text-xs mb-4 leading-relaxed line-clamp-2 min-h-[2rem]">
                      {prod.description}
                    </p>
                    
                    {/* Pack size and price strip */}
                    <div className="flex justify-center items-center gap-4 mb-5 text-xs border-t border-b border-marigold-500/20 py-2.5">
                      <div>
                        <span className="text-espresso-700/70 block text-[10px] uppercase tracking-wider">Pack Size</span> 
                        <span className="font-bold text-espresso-900 text-sm">{prod.unit || '100g'}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-marigold-500/20"></div>
                      <div>
                        <span className="text-espresso-700/70 block text-[10px] uppercase tracking-wider">Price</span> 
                        <div className="flex items-baseline gap-1.5 justify-center">
                          <span className="font-bold text-kumkum-600 text-base">₹{prod.price}</span>
                          {prod.mrp > prod.price && (
                            <span className="text-[11px] text-espresso-400 line-through">₹{prod.mrp}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto flex flex-col gap-2">
                      {purchasable ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleAdd(prod)}
                            className="w-full py-3 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest hover:bg-espresso-800 transition-colors rounded-sm flex items-center justify-center gap-2 text-xs shadow-sm active:scale-[0.98]"
                          >
                            {justAddedId === prod.id ? (
                              <>
                                <Check size={16} className="text-emerald-400" /> Added to Cart!
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} /> Add to Cart
                              </>
                            )}
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <Link 
                              to={`/product/${prod.slug || prod.id}`} 
                              className="py-2 bg-white border border-espresso-300 text-espresso-900 font-bold uppercase tracking-wider hover:bg-chai-100 transition-colors rounded-sm text-center text-[11px] flex items-center justify-center gap-1"
                            >
                              <Eye size={13} /> View
                            </Link>
                            <Link 
                              to={`/contact?product=${encodeURIComponent(prod.name)}`} 
                              className="py-2 border border-marigold-500 text-espresso-900 font-bold uppercase tracking-wider hover:bg-marigold-100/60 transition-colors rounded-sm text-center text-[11px]"
                            >
                              Enquiry
                            </Link>
                          </div>
                        </>
                      ) : isComingSoonProd ? (
                        <>
                          <div className="w-full py-2.5 px-3 bg-amber-50 border border-amber-300 text-amber-900 font-bold uppercase tracking-wider rounded-sm text-center text-[11px] flex items-center justify-center gap-1.5 shadow-sm">
                            <Clock size={14} className="text-amber-600 flex-shrink-0" />
                            <span>Coming Soon — Not Available for Purchase Yet</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Link 
                              to={`/product/${prod.slug || prod.id}`} 
                              className="py-2 bg-white border border-espresso-300 text-espresso-900 font-bold uppercase tracking-wider hover:bg-chai-100 transition-colors rounded-sm text-center text-[11px] flex items-center justify-center gap-1"
                            >
                              <Eye size={13} /> View Details
                            </Link>
                            <Link 
                              to={`/contact?product=${encodeURIComponent(prod.name)}`} 
                              className="py-2 border border-marigold-500 text-espresso-900 font-bold uppercase tracking-wider hover:bg-marigold-100/60 transition-colors rounded-sm text-center text-[11px]"
                            >
                              Pre-Order Enquiry
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-full py-2.5 px-3 bg-chai-100 border border-espresso-300 text-espresso-700 font-bold uppercase tracking-wider rounded-sm text-center text-[11px]">
                            Currently Out of Stock
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Link 
                              to={`/product/${prod.slug || prod.id}`} 
                              className="py-2 bg-white border border-espresso-300 text-espresso-900 font-bold uppercase tracking-wider hover:bg-chai-100 transition-colors rounded-sm text-center text-[11px] flex items-center justify-center gap-1"
                            >
                              <Eye size={13} /> View
                            </Link>
                            <Link 
                              to={`/contact?product=${encodeURIComponent(prod.name)}`} 
                              className="py-2 border border-marigold-500 text-espresso-900 font-bold uppercase tracking-wider hover:bg-marigold-100/60 transition-colors rounded-sm text-center text-[11px]"
                            >
                              Enquiry
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
