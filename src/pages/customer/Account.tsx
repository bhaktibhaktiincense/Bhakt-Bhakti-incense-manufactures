import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { fetchProducts } from '../../services/productService';
import { Product, isComingSoon, isOutOfStock, isProductPurchasable } from '../../types/product';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Package, User, LogOut, FileText, Download, Heart, ShoppingBag, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { InvoiceTemplate } from '../../components/InvoiceTemplate';
import { downloadInvoicePDF } from '../../utils/invoice';

export default function Account() {
  const { user, signOut } = useAuth();
  const { wishlistIds, toggleLike } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('orders');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Check URL query for tab selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'wishlist' || tabParam === 'orders' || tabParam === 'profile') {
      setActiveTab(tabParam as any);
    }
  }, []);

  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingId(orderId);
    const element = document.getElementById(`invoice-${orderId}`);
    if (element) {
      await downloadInvoicePDF(element, orderId);
    }
    setDownloadingId(null);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch profile
        const { data: prof, error: profErr } = await supabase.from('customer_profiles').select('*').eq('id', user.id).single();
        if (profErr && profErr.code !== 'PGRST116' && profErr.code !== 'PGRST205') throw profErr;
        if (prof) setProfile(prof);

        // 2. Fetch orders
        const { data: ords, error: ordErr } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
        if (ordErr && ordErr.code !== 'PGRST205') throw ordErr;
        if (ords) setOrders(ords);

        // 3. Fetch products to populate wishlist items
        const prods = await fetchProducts(false);
        setAllProducts(prods);
      } catch (e: any) {
        if (e.code !== 'PGRST205') console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  const handleQuickAdd = async (product: Product) => {
    if (!isProductPurchasable(product)) return;
    await addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      availability_label: product.availability_label
    });
    setAddedItemNotice(product.id);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  if (!user || loading) {
    return <div className="pt-32 min-h-screen bg-chai-50 flex justify-center text-espresso-600">Loading your sacred account...</div>;
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-chai-200 overflow-hidden flex-shrink-0 h-max">
            <div className="p-6 bg-espresso-900 text-chai-50 border-b border-espresso-800">
              <h2 className="font-serif text-xl text-marigold-400">My Account</h2>
              <p className="text-xs text-chai-300 mt-1 truncate">{user.email}</p>
            </div>
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'orders' ? 'bg-marigold-100 text-espresso-900 font-bold' : 'text-espresso-700 hover:bg-chai-100'
                }`}
              >
                <Package size={18} />
                <span>My Orders</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'wishlist' ? 'bg-marigold-100 text-espresso-900 font-bold' : 'text-espresso-700 hover:bg-chai-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Heart size={18} className={wishlistIds.length > 0 ? "text-kumkum-600 fill-kumkum-600" : ""} />
                  <span>My Wishlist</span>
                </div>
                {wishlistIds.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-kumkum-100 text-kumkum-700 rounded-full">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'bg-marigold-100 text-espresso-900 font-bold' : 'text-espresso-700 hover:bg-chai-100'
                }`}
              >
                <User size={18} />
                <span>Profile Info</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-kumkum-600 hover:bg-kumkum-50 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-serif text-3xl text-espresso-900 mb-6">Order History</h3>
                
                {orders.length === 0 ? (
                  <div className="bg-white p-10 rounded-2xl shadow-sm border border-chai-200 text-center">
                    <Package size={48} className="mx-auto text-espresso-300 mb-4" />
                    <p className="text-espresso-700 font-medium mb-4">You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/products')} className="px-6 py-2.5 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-xs hover:bg-marigold-400 transition-colors rounded-xl shadow-xs">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-chai-200 overflow-hidden">
                        <div className="bg-chai-100/70 p-4 border-b border-chai-200 flex flex-wrap justify-between items-center gap-4 text-sm">
                          <div>
                            <span className="text-espresso-600 block uppercase tracking-wider text-xs font-bold mb-1">Order Date</span>
                            <span className="font-medium text-espresso-900">{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <div>
                            <span className="text-espresso-600 block uppercase tracking-wider text-xs font-bold mb-1">Order ID</span>
                            <span className="font-medium text-espresso-900 font-mono">{String(order.id).slice(0, 8).toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-espresso-600 block uppercase tracking-wider text-xs font-bold mb-1">Total Amount</span>
                            <span className="font-medium text-espresso-900 font-serif font-bold">₹{order.total}</span>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Processing' || order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status || 'Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="space-y-4">
                            {order.order_items?.map((item: any, i: number) => (
                              <div key={i} className="flex items-center space-x-4 border-b border-chai-100 pb-4 last:border-b-0 last:pb-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.product_name || item.name} className="w-14 h-14 object-cover rounded-lg border border-chai-200" />
                                ) : (
                                  <div className="w-14 h-14 bg-chai-100 rounded-lg flex items-center justify-center font-bold text-espresso-600">
                                    {(item.product_name || item.name || 'P').charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium text-espresso-900">{item.product_name || item.name}</h4>
                                  <p className="text-xs text-espresso-500">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <span className="font-serif font-bold text-espresso-900">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-chai-200 flex flex-wrap justify-between items-center gap-4">
                            <span className="text-xs text-espresso-500">Payment: Cash on Delivery (COD)</span>
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/invoice/${order.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-xs font-bold text-espresso-700 hover:text-marigold-600 transition-colors"
                              >
                                <FileText size={16} />
                                <span>View Invoice</span>
                              </Link>
                              <button
                                onClick={() => handleDownloadInvoice(order.id)}
                                disabled={downloadingId === order.id}
                                className="inline-flex items-center space-x-2 text-xs font-bold px-3 py-1.5 bg-chai-100 hover:bg-marigold-500 hover:text-white rounded-lg transition-colors text-espresso-800"
                              >
                                <Download size={14} className={downloadingId === order.id ? 'animate-bounce' : ''} />
                                <span>{downloadingId === order.id ? 'Saving PDF...' : 'Download PDF'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Hidden Invoice Component for PDF Generation */}
                        <div className="absolute top-[-9999px] left-[-9999px]">
                          <InvoiceTemplate id={`invoice-${order.id}`} order={order} orderItems={order.order_items || []} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-3xl text-espresso-900">My Sacred Wishlist</h3>
                    <p className="text-xs text-espresso-600 mt-1">Saved incense fragrances ready for your sacred spaces</p>
                  </div>
                  {wishlistProducts.length > 0 && (
                    <span className="text-xs font-bold text-espresso-500 bg-white px-3 py-1.5 rounded-full border border-chai-200 shadow-2xs">
                      {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Offering' : 'Offerings'}
                    </span>
                  )}
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl shadow-sm border border-chai-200 text-center">
                    <div className="w-16 h-16 rounded-full bg-kumkum-50 text-kumkum-500 flex items-center justify-center mx-auto mb-4 border border-kumkum-200">
                      <Heart size={32} />
                    </div>
                    <h4 className="font-serif text-xl font-bold text-espresso-900 mb-2">Your Sacred Wishlist is Empty</h4>
                    <p className="text-espresso-600 text-xs max-w-sm mx-auto mb-6">
                      Explore our handcrafted incense offerings and tap the heart icon on any fragrance to save it here for later.
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-xs hover:bg-marigold-400 transition-colors rounded-xl shadow-xs"
                    >
                      <span>Explore Fragrances</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map(p => {
                      const isComing = isComingSoon(p.availability_label);
                      const isOut = isOutOfStock(p);
                      const canBuy = isProductPurchasable(p);

                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-chai-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                          <div className="flex gap-4">
                            <Link to={`/product/${p.slug || p.id}`} className="w-20 h-20 rounded-xl bg-chai-50 p-2 flex-shrink-0 flex items-center justify-center border border-chai-100">
                              <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                            </Link>

                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] uppercase font-bold text-marigold-600 tracking-wider">
                                {p.category}
                              </div>
                              <h4 className="font-bold text-espresso-900 text-sm truncate mt-0.5">
                                <Link to={`/product/${p.slug || p.id}`} className="hover:text-kumkum-600 transition-colors">
                                  {p.name}
                                </Link>
                              </h4>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-serif font-bold text-kumkum-600 text-base">₹{p.price}</span>
                                {p.mrp > p.price && (
                                  <span className="text-xs text-espresso-400 line-through">₹{p.mrp}</span>
                                )}
                              </div>
                              <div className="mt-1">
                                {isComing ? (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    Coming Soon
                                  </span>
                                ) : isOut ? (
                                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                    Out of Stock
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-chai-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLike(p.id)}
                              className="text-xs text-kumkum-600 hover:text-kumkum-800 font-bold flex items-center gap-1 p-1.5 rounded-lg hover:bg-kumkum-50 transition-colors"
                              title="Remove from Wishlist"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>

                            {canBuy ? (
                              <button
                                type="button"
                                onClick={() => handleQuickAdd(p)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                  addedItemNotice === p.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-espresso-900 text-chai-50 hover:bg-espresso-800'
                                }`}
                              >
                                <ShoppingCart size={14} />
                                <span>{addedItemNotice === p.id ? 'Added to Cart!' : 'Add to Cart'}</span>
                              </button>
                            ) : (
                              <span className="text-xs text-espresso-400 italic">
                                Not Available
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-serif text-3xl text-espresso-900 mb-6">Profile Information</h3>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-chai-200">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-espresso-500 uppercase tracking-widest mb-1">Full Name</label>
                      <p className="text-lg text-espresso-900 font-medium">{profile?.name || user?.user_metadata?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-espresso-500 uppercase tracking-widest mb-1">Email Address</label>
                      <p className="text-lg text-espresso-900 font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-espresso-500 uppercase tracking-widest mb-1">Phone Number</label>
                      <p className="text-lg text-espresso-900 font-medium">{profile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-espresso-500 uppercase tracking-widest mb-1">Saved Address</label>
                      <p className="text-lg text-espresso-900 font-medium whitespace-pre-wrap">{profile?.address || 'No address saved.'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
