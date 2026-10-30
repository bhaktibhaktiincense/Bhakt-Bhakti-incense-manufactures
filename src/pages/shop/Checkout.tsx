import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';
import { Lock, Truck, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { isComingSoon, isOutOfStock } from '../../types/product';
import { useSEO } from '../../hooks/useSEO';
import { trackCheckoutStart, trackOrderCompleted } from '../../utils/analytics';

export default function Checkout() {
  useSEO({
    title: "Secure Checkout",
    description: "Complete your order with Bhakt & Bhakti Incense. Cash on Delivery supported across India.",
    path: "/checkout"
  });

  const { user } = useAuth();
  const { items, cartTotal, shippingCharge, cartTotalWithShipping, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track Checkout Start event in Website Analytics
  useEffect(() => {
    if (items.length > 0) {
      trackCheckoutStart(cartTotalWithShipping, items.length, items);
    }
  }, [items.length]);

  // Pre-fill profile data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email || prev.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || prev.name
      }));

      const fetchProfile = async () => {
        try {
          const { data } = await supabase.from('customer_profiles').select('*').eq('id', user.id).single();
          if (data) {
            setFormData(prev => ({
              ...prev,
              name: data.name || prev.name,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
            }));
          }
        } catch {
          // ignore profile fetch error
        }
      };
      fetchProfile();
    }
  }, [user]);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (items.length === 0 && !placing) {
      navigate('/cart');
    }
  }, [items.length, placing, navigate]);

  if (items.length === 0) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number for order delivery.");
      return;
    }

    const cleanPin = formData.pincode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit Indian postal PIN code.");
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setError("Please enter your complete house/flat number and street address.");
      return;
    }

    if (!formData.city.trim() || !formData.state.trim()) {
      setError("Please enter your city and state.");
      return;
    }

    setPlacing(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('create_order', {
        p_customer_name: formData.name.trim(),
        p_phone: cleanPhone,
        p_email: formData.email.trim() || `${cleanPhone}@customer.bbincense.in`,
        p_shipping_address: formData.address.trim(),
        p_city: formData.city.trim(),
        p_state: formData.state.trim(),
        p_pincode: cleanPin,
        p_order_notes: formData.notes.trim(),
        p_items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity
        })),
        p_user_id: user?.id || null
      });

      if (rpcError) {
        console.error("RPC Order error:", rpcError);
        throw new Error(rpcError.message || "Failed to place order.");
      }

      const result = data;

      // Save order snapshot locally so confirmation and invoice pages render reliably
      const orderSnapshot = {
        id: result.orderId,
        order_number: result.orderNumber,
        customer_name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        shipping_address: `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${cleanPin}`,
        subtotal: result.subtotal,
        shipping_charge: result.shippingCharge,
        total: result.total,
        status: "Pending",
        payment_status: "Pending (COD)",
        payment_method: "COD",
        created_at: new Date().toISOString(),
        order_items: result.items || items
      };
      
      try {
        localStorage.setItem(`order_${result.orderId}`, JSON.stringify(orderSnapshot));
        localStorage.setItem('latest_order', JSON.stringify(orderSnapshot));
      } catch (storageErr) {
        console.warn("Storage warning:", storageErr);
      }

      // Track completed order in Website Analytics
      trackOrderCompleted(
        result.orderId || result.orderNumber, 
        result.total || cartTotalWithShipping, 
        result.items || items
      );

      // Clear shopping cart
      await clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${result.orderId}`);

    } catch (err: any) {
      console.error("Order placement error:", err);
      setError(err.message || "An unexpected error occurred while placing your order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-chai-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-espresso-900 mb-1">Finalize Your Sacred Order</h1>
            <p className="text-espresso-600 text-sm">Please verify your delivery address for Cash on Delivery shipment.</p>
          </div>
          <Link to="/cart" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-espresso-700 hover:text-marigold-600 font-bold uppercase tracking-wider">
            <ArrowLeft size={16} /> Return to Cart
          </Link>
        </div>
        
        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Delivery and Contact Form */}
          <div className="flex-1 space-y-6">
            {error && (
              <div className="bg-kumkum-50 text-kumkum-800 p-4 rounded-xl text-sm border-2 border-kumkum-200 flex items-start gap-3">
                <AlertCircle size={20} className="text-kumkum-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Could not complete order:</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-chai-200">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-chai-200">
                <h2 className="font-serif text-2xl text-espresso-900 font-bold">
                  1. Delivery Details
                </h2>
                {!user && (
                  <span className="text-xs text-espresso-500">
                    Already registered? <Link to="/login" className="text-marigold-600 font-bold hover:underline">Log in</Link>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    10-Digit Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-espresso-500">+91</span>
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      className="w-full pl-12 pr-3 py-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                    />
                  </div>
                  <span className="text-[10px] text-espresso-500 mt-1 block">Used by our courier partner for delivery updates and COD OTP.</span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    Email Address (For Invoice Receipt)
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="name@example.com (optional)"
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    Delivery Address (House / Flat No, Street, Landmark) *
                  </label>
                  <textarea 
                    name="address" 
                    required 
                    rows={3} 
                    placeholder="House/Apartment #, Building, Street, Landmark..."
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    City / Town *
                  </label>
                  <input 
                    type="text" 
                    name="city" 
                    required 
                    placeholder="e.g. Mumbai, Varanasi, Jaipur"
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input 
                    type="text" 
                    name="state" 
                    required 
                    placeholder="e.g. Uttar Pradesh, Maharashtra"
                    value={formData.state} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    PIN Code (6 Digits) *
                  </label>
                  <input 
                    type="text" 
                    name="pincode" 
                    required 
                    maxLength={6}
                    placeholder="e.g. 221001"
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1.5">
                    Delivery Instructions (Optional)
                  </label>
                  <input 
                    type="text" 
                    name="notes" 
                    placeholder="e.g. Ring bell, Leave with security"
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm text-espresso-900 focus:border-marigold-500 focus:bg-white focus:ring-1 focus:ring-marigold-500 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-chai-200">
              <h2 className="font-serif text-2xl text-espresso-900 font-bold mb-4">
                2. Payment Method
              </h2>
              
              <div className="p-4 border-2 border-marigold-500 bg-amber-50/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-marigold-500 flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-espresso-900 text-sm block">Cash on Delivery (COD)</span>
                    <span className="text-xs text-espresso-600">Pay securely with cash upon delivery at your doorstep</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-kumkum-700 bg-kumkum-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Verified
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-espresso-500 bg-chai-50 p-3 rounded-lg border border-chai-200">
                <Lock size={14} className="text-espresso-400 flex-shrink-0" />
                <span>Online payment gateway (UPI/Credit Cards) is currently in verification and will be activated soon.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md border border-chai-200 p-6 md:p-7 sticky top-28">
              <h3 className="font-serif text-2xl text-espresso-900 mb-5 border-b border-chai-200 pb-4 font-bold">
                Order Summary
              </h3>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center text-sm gap-3">
                    <div className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 bg-chai-100 rounded-lg border border-chai-200 flex-shrink-0 p-1 flex items-center justify-center">
                        <img 
                          src={item.image || '/IMG-20260808-WA0005.jpg'} 
                          alt={item.name} 
                          className="w-full h-full object-contain" 
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-espresso-900 text-chai-50 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-espresso-900 text-xs block leading-tight">{item.name}</span>
                        <span className="text-[11px] text-espresso-500">₹{item.price} each</span>
                      </div>
                    </div>
                    <span className="font-serif text-espresso-900 font-bold text-sm whitespace-nowrap">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal & Shipping breakdown */}
              <div className="border-t border-chai-200 pt-4 space-y-2.5 mb-6 text-espresso-700 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-bold text-espresso-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-espresso-500" /> Delivery Fee
                  </span>
                  {shippingCharge === 0 ? (
                    <span className="text-emerald-700 font-bold text-xs uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      FREE DELIVERY
                    </span>
                  ) : (
                    <span className="font-serif font-bold text-espresso-900">₹{shippingCharge}</span>
                  )}
                </div>

                {cartTotal < 500 && (
                  <p className="text-[11px] text-marigold-700 bg-amber-50 p-2 rounded border border-amber-200">
                    💡 Add ₹{500 - cartTotal} more to qualify for <strong>FREE Home Delivery</strong>!
                  </p>
                )}
              </div>
              
              {/* Grand Total */}
              <div className="border-t-2 border-chai-200 pt-4 mb-6 flex justify-between items-baseline text-espresso-900">
                <div>
                  <span className="font-bold uppercase tracking-wider text-xs block text-espresso-600">Total Due (COD)</span>
                  <span className="text-[10px] text-espresso-400">Inclusive of all taxes</span>
                </div>
                <span className="font-serif text-3xl font-bold text-kumkum-600">
                  ₹{cartTotalWithShipping}
                </span>
              </div>
              
              {/* Place Order Button */}
              <button 
                type="submit"
                disabled={placing}
                className="w-full py-4 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-xs hover:bg-marigold-400 transition-all rounded-lg disabled:opacity-60 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-espresso-900 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying & Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order (Cash on Delivery)</span>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-espresso-500 text-center">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Genuine Sacred Incense • Verified Quality</span>
              </div>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}
