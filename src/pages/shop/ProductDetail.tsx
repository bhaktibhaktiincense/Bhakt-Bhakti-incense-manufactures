import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Flame, 
  PackageCheck,
  Share2,
  ChevronRight,
  MessageCircleQuestion,
  Heart
} from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '../../services/productService';
import { Product, isComingSoon, isOutOfStock, isProductPurchasable } from '../../types/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { ProductShareModal } from '../../components/shop/ProductShareModal';
import { useSEO } from '../../hooks/useSEO';
import { trackProductView } from '../../utils/analytics';

export default function ProductDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLiked, getLikeCount, toggleLike, fetchProductLikeData } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [likeNotice, setLikeNotice] = useState<string | null>(null);

  const identifier = slug || id || '';

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const item = await fetchProductBySlug(identifier);
        if (!isMounted) return;
        setProduct(item);
        if (item) {
          setSelectedImage(item.image);
          // Track product view in Website Analytics
          trackProductView(item.id, item.name);
          // Fetch related active items
          const all = await fetchProducts(false);
          const others = all.filter(p => p.id !== item.id && p.slug !== item.slug).slice(0, 3);
          setRelatedProducts(others);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, [identifier]);

  useEffect(() => {
    if (product?.id) {
      fetchProductLikeData(product.id);
    }
  }, [product?.id, fetchProductLikeData]);

  useSEO({
    title: product ? `${product.name} - Handcrafted Incense` : "Sacred Incense Products",
    description: product ? product.description.slice(0, 155) : "Discover authentic Indian agarbatti handcrafted with natural herbs and pure essential oils.",
    path: `/product/${identifier}`
  });

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-chai-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-marigold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-espresso-700 font-serif text-lg tracking-wide">Invoking sacred fragrance details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-chai-50 container mx-auto px-6 text-center">
        <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-md border border-chai-200">
          <h2 className="font-serif text-3xl text-espresso-900 mb-3">Product Not Found</h2>
          <p className="text-espresso-600 text-sm mb-6">
            The incense offering you are looking for might have been retired or the link is incorrect.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest text-xs rounded hover:bg-espresso-800 transition-colors"
          >
            <ArrowLeft size={16} /> Explore All Offerings
          </Link>
        </div>
      </div>
    );
  }

  const isComingSoonProd = isComingSoon(product.availability_label);
  const isOutStock = isOutOfStock(product);
  const purchasable = isProductPurchasable(product);
  const isAvailable = purchasable;
  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;
  const galleryList = product.gallery_images && product.gallery_images.length > 0 
    ? product.gallery_images 
    : [product.image];

  const handleAddToCart = async () => {
    if (!purchasable) return;
    const res = await addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      availability_label: product.availability_label
    });
    if (res?.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (!purchasable) return;
    const res = await addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      availability_label: product.availability_label
    });
    if (res?.success) {
      navigate('/checkout');
    }
  };

  const liked = product ? isLiked(product.id) : false;
  const likesCount = product ? getLikeCount(product.id) : 0;


  const handleToggleLike = async () => {
    if (!product) return;
    const nowLiked = await toggleLike(product.id);
    setLikeNotice(nowLiked ? "Added to your Sacred Wishlist! ❤️" : "Removed from Wishlist");
    setTimeout(() => setLikeNotice(null), 2500);
  };

  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/product/${product?.slug || product?.id}` 
    : `https://bbincense.in/product/${product?.slug || product?.id}`;

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.name} - Bhakt & Bhakti Incense`,
      text: `Experience the divine aroma of ${product.name} by Bhakt & Bhakti Incense. 100% Charcoal-Free handcrafted masala agarbatti:`,
      url: canonicalUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback share modal for desktop or unsupported browsers
    setShareModalOpen(true);
  };

  return (
    <div className="pt-24 bg-chai-50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-chai-100/70 border-b border-chai-200 py-3.5 px-6">
        <div className="container mx-auto flex items-center gap-2 text-xs text-espresso-600">
          <Link to="/" className="hover:text-marigold-600 transition-colors">Home</Link>
          <ChevronRight size={14} className="text-espresso-400" />
          <Link to="/products" className="hover:text-marigold-600 transition-colors">Products</Link>
          <ChevronRight size={14} className="text-espresso-400" />
          <span className="text-espresso-500">{product.category}</span>
          <ChevronRight size={14} className="text-espresso-400" />
          <span className="text-espresso-900 font-bold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image Showcase & Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border-2 border-chai-200 relative overflow-hidden flex items-center justify-center min-h-[360px] md:min-h-[480px]">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={selectedImage || product.image} 
                alt={`Bhakt & Bhakti ${product.name}`}
                loading="lazy"
                className="max-h-[420px] w-auto object-contain mx-auto transition-transform hover:scale-105 duration-500"
              />

              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                <span className={`text-xs px-3.5 py-1.5 uppercase tracking-wider font-bold rounded-full shadow-sm ${
                  isComingSoonProd
                    ? 'bg-amber-600 text-white'
                    : isOutStock
                    ? 'bg-red-700 text-white'
                    : 'bg-kumkum-600 text-chai-50'
                }`}>
                  {isComingSoonProd ? 'Coming Soon' : isOutStock ? 'Out of Stock' : (product.availability_label || 'Available Now')}
                </span>
              </div>

              {/* Floating Top Right Action Overlay: Like / Wishlist & Share */}
              <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                {discountPercent > 0 && purchasable && (
                  <div className="bg-marigold-500 text-espresso-900 text-xs px-3 py-1 font-bold rounded-full uppercase tracking-wider shadow-sm">
                    {discountPercent}% OFF
                  </div>
                )}
                {/* Heart Button */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  className={`p-2.5 rounded-full backdrop-blur-md shadow-md border transition-all flex items-center justify-center cursor-pointer ${
                    liked 
                      ? 'bg-kumkum-50 text-kumkum-600 border-kumkum-300 ring-2 ring-kumkum-200' 
                      : 'bg-white/95 text-espresso-600 hover:text-kumkum-600 border-chai-200 hover:bg-white'
                  }`}
                  title={liked ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart 
                    size={20} 
                    className={`transition-all duration-300 ${
                      liked ? 'fill-kumkum-600 text-kumkum-600 scale-110' : 'hover:scale-110'
                    }`} 
                  />
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="p-2.5 rounded-full bg-white/95 hover:bg-white text-espresso-600 hover:text-marigold-600 border border-chai-200 shadow-md backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
                  title="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl bg-white p-1.5 border-2 transition-all ${
                      selectedImage === imgUrl 
                        ? 'border-kumkum-600 shadow-md ring-2 ring-kumkum-200' 
                        : 'border-chai-200 hover:border-marigold-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} loading="lazy" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Sacred Guarantee Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 text-center">
              <div className="bg-chai-100/80 p-3.5 rounded-xl border border-chai-200">
                <ShieldCheck size={20} className="mx-auto text-kumkum-600 mb-1" />
                <span className="text-[11px] font-bold text-espresso-900 uppercase block">100% Charcoal-Free</span>
                <span className="text-[10px] text-espresso-600">Pure Herbal Masala</span>
              </div>
              <div className="bg-chai-100/80 p-3.5 rounded-xl border border-chai-200">
                <Clock size={20} className="mx-auto text-marigold-600 mb-1" />
                <span className="text-[11px] font-bold text-espresso-900 uppercase block">45-50 Mins</span>
                <span className="text-[10px] text-espresso-600">Slow Even Burn</span>
              </div>
              <div className="bg-chai-100/80 p-3.5 rounded-xl border border-chai-200">
                <PackageCheck size={20} className="mx-auto text-espresso-800 mb-1" />
                <span className="text-[11px] font-bold text-espresso-900 uppercase block">Air-Tight Zipper</span>
                <span className="text-[10px] text-espresso-600">Preserves Fresh Aroma</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Stock, Quantity, and Actions */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-widest font-bold text-marigold-600 bg-marigold-100/80 px-2.5 py-1 rounded">
                  {product.category}
                </span>
                {product.sku && (
                  <span className="text-xs text-espresso-500 font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
              
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-espresso-900 font-bold leading-tight">
                {product.name}
              </h1>

              {/* Pack details */}
              <p className="text-espresso-600 text-sm mt-1.5 flex items-center gap-2">
                <span>Net Quantity: <strong>{product.unit || '100g'}</strong></span>
                <span>•</span>
                <span>Handcrafted in India</span>
              </p>
            </div>

            {/* Wishlist & Share Bar (Modern Flipkart / E-commerce style) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-chai-200 shadow-xs">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                    liked
                      ? 'bg-kumkum-50 text-kumkum-700 border-kumkum-200 shadow-xs ring-1 ring-kumkum-200'
                      : 'bg-chai-50 text-espresso-800 hover:bg-chai-100 border-chai-200'
                  }`}
                >
                  <Heart
                    size={17}
                    className={`transition-colors duration-200 ${
                      liked ? 'fill-kumkum-600 text-kumkum-600 scale-105' : 'text-espresso-600'
                    }`}
                  />
                  <span>{liked ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                {/* Total Product Likes Count Badge */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-2 bg-chai-100/70 text-espresso-800 rounded-xl text-xs font-bold border border-chai-200"
                  title={`${likesCount} devotees liked this fragrance`}
                >
                  <span className="text-kumkum-600">❤️</span>
                  <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
                </div>
              </div>

              {/* Share Button with Label */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-chai-50 hover:bg-marigold-50 text-espresso-800 hover:text-marigold-800 border border-chai-200 hover:border-marigold-300 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Share2 size={16} className="text-marigold-600" />
                <span>Share Offering</span>
              </button>
            </div>

            {/* Like notification toast banner */}
            {likeNotice && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-kumkum-50 border border-kumkum-200 rounded-xl text-xs font-bold text-kumkum-800 flex items-center gap-2 shadow-xs"
              >
                <Heart size={15} className="fill-kumkum-600 text-kumkum-600 flex-shrink-0" />
                <span>{likeNotice}</span>
              </motion.div>
            )}

            {/* Price section */}
            <div className="bg-white p-5 rounded-2xl border border-chai-200 shadow-sm flex items-baseline gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-espresso-500 block mb-0.5 font-bold">Special Price</span>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-kumkum-600">
                    ₹{product.price}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-lg text-espresso-400 line-through">
                      ₹{product.mrp}
                    </span>
                  )}
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="ml-auto text-right">
                  <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Save ₹{product.mrp - product.price} ({discountPercent}%)
                  </span>
                  <span className="block text-[11px] text-espresso-500 mt-1">Inclusive of all taxes</span>
                </div>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isComingSoonProd ? 'bg-amber-500 animate-pulse' :
                product.stock_quantity > 10 ? 'bg-emerald-500 animate-pulse' :
                product.stock_quantity > 0 ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span className="font-medium text-espresso-800">
                {isComingSoonProd
                  ? 'Coming Soon — Traditional Fragrance Preparation & Curing in Progress'
                  : product.stock_quantity > 20 
                  ? 'In Stock — Dispatched within 24 hours' 
                  : product.stock_quantity > 0 
                  ? `Only ${product.stock_quantity} packets remaining!` 
                  : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector & Action Buttons OR Coming Soon Notice */}
            {purchasable ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-espresso-900 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border-2 border-chai-200 bg-white rounded-lg overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-espresso-700 hover:bg-chai-100 disabled:opacity-40 transition-colors font-bold text-lg"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 font-bold text-espresso-900 text-base min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity || 99, q + 1))}
                      disabled={quantity >= (product.stock_quantity || 99)}
                      className="px-4 py-2 text-espresso-700 hover:bg-chai-100 disabled:opacity-40 transition-colors font-bold text-lg"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-espresso-500">
                    Subtotal: <strong>₹{product.price * quantity}</strong>
                  </span>
                </div>

                {/* Primary CTA Buttons */}
                <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-espresso-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-4 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-marigold-400 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    Buy Now (Cash on Delivery)
                  </button>
                </div>

                {/* Added to Cart Feedback Toast */}
                {addedNotice && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-emerald-600" />
                      <span>Added {quantity}x {product.name} to your cart!</span>
                    </div>
                    <Link to="/cart" className="underline hover:text-emerald-950 font-bold">
                      View Cart & Checkout →
                    </Link>
                  </motion.div>
                )}

                {/* Free Delivery note */}
                <p className="text-xs text-espresso-600 bg-chai-100/60 p-3 rounded-lg border border-chai-200">
                  🚚 <strong>Free Home Delivery</strong> on orders over ₹500 across India. Cash on Delivery (COD) supported.
                </p>
              </div>
            ) : isComingSoonProd ? (
              <div className="bg-amber-50/90 border-2 border-amber-300 p-6 rounded-2xl shadow-sm text-espresso-900 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base md:text-lg">
                  <Clock size={22} className="text-amber-600 flex-shrink-0" />
                  <span>Coming Soon — Not Available for Purchase Yet</span>
                </div>
                <p className="text-xs md:text-sm text-espresso-700 leading-relaxed">
                  This authentic incense creation is currently being crafted and cured in our sacred fragrance room. Customers cannot purchase this item yet until it officially launches. You may send an inquiry below for pre-order requests or bulk requirements.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/contact?product=${encodeURIComponent(product.name)}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-espresso-900 text-chai-50 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-espresso-800 transition-colors shadow-sm"
                  >
                    <MessageCircleQuestion size={16} /> Send Pre-Order / Launch Inquiry
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 px-4 py-3 bg-white border border-chai-300 text-espresso-800 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-chai-100 transition-colors"
                  >
                    Explore Available Offerings →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-espresso-800 space-y-3">
                <p className="font-bold text-red-800 text-base">Currently Out of Stock</p>
                <p className="text-xs text-espresso-600">
                  This fragrance is currently sold out. New batches are curing and will be restocked soon.
                </p>
                <Link
                  to={`/contact?product=${encodeURIComponent(product.name)}`}
                  className="inline-block px-5 py-2.5 bg-marigold-500 text-espresso-900 font-bold text-xs uppercase tracking-wider rounded hover:bg-marigold-400 transition-colors"
                >
                  Notify Me When Restocked
                </Link>
              </div>
            )}

            {/* Description & Devotional Experience */}
            <div className="border-t border-chai-200 pt-6 space-y-4">
              <h3 className="font-serif text-xl text-espresso-900 font-bold">About This Fragrance</h3>
              <p className="text-espresso-700 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Bulk & Wholesale Inquiries */}
            <div className="border-t border-chai-200 pt-5 flex items-center justify-between text-xs text-espresso-600">
              <span className="flex items-center gap-1.5 font-medium">
                <MessageCircleQuestion size={16} className="text-kumkum-600" /> Wholesale or temple bulk requirement?
              </span>
              <Link 
                to={`/contact?product=${encodeURIComponent(product.name)}`}
                className="text-kumkum-600 font-bold hover:underline"
              >
                Inquire Bulk Rates →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Sacred Offerings */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t-2 border-chai-200 pt-16">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl text-espresso-900 mb-2">Explore Other Sacred Collections</h2>
              <p className="text-espresso-600 text-sm">Handcrafted with ancient Indian devotion and purest botanical essence.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-chai-200 hover:shadow-xl transition-all flex flex-col group"
                >
                  <Link to={`/product/${rel.slug || rel.id}`} className="block h-56 bg-chai-100 p-6 relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={rel.image} 
                      alt={rel.name} 
                      className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-kumkum-600 text-chai-50 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      ₹{rel.price}
                    </div>
                  </Link>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-marigold-600 tracking-wider mb-1 block">
                      {rel.category}
                    </span>
                    <h3 className="font-serif text-xl text-espresso-900 font-bold mb-2">
                      <Link to={`/product/${rel.slug || rel.id}`} className="hover:text-kumkum-600 transition-colors">
                        {rel.name}
                      </Link>
                    </h3>
                    <p className="text-espresso-600 text-xs line-clamp-2 mb-4 flex-1">
                      {rel.description}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${rel.slug || rel.id}`}
                        className="flex-1 py-2.5 border border-espresso-900 text-espresso-900 text-center font-bold text-xs uppercase tracking-wider rounded hover:bg-espresso-900 hover:text-chai-50 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => addToCart({ product_id: rel.id, name: rel.name, price: rel.price, quantity: 1, image: rel.image })}
                        className="p-2.5 bg-marigold-500 text-espresso-900 rounded hover:bg-marigold-400 transition-colors"
                        title="Quick Add"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {product && (
        <ProductShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          product={product}
          shareUrl={canonicalUrl}
        />
      )}
    </div>
  );
}
