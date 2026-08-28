import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { Lock } from 'lucide-react';

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !user) {
      alert("Please log in or sign up to complete your checkout.");
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
      const fetchProfile = async () => {
        const { data, error } = await supabase.from('customer_profiles').select('*').eq('id', user.id).single();
        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
          }));
        }
        if (error && error.code !== 'PGRST205') console.error(error);
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user && items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div className="pt-32 min-h-screen bg-chai-50 flex justify-center text-espresso-600">Loading checkout...</div>;
  }

  if (items.length === 0) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError(null);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}${formData.notes ? `\n\nNotes: ${formData.notes}` : ''}`;

      // Insert Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shipping_address: fullAddress,
          subtotal: cartTotal,
          total: cartTotalWithShipping,
          status: 'Pending',
          payment_status: 'Pending (COD)'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update Customer Profile implicitly
      await supabase.from('customer_profiles').upsert({
        id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress
      });

      // Clear Cart
      await clearCart();
      
      // Try sending confirmation email via full-stack route (graceful fallback if it fails)
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: order.id, 
            customerEmail: formData.email,
            customerName: formData.name,
            shippingAddress: fullAddress,
            items: orderItems,
            subtotal: cartTotal,
            shippingCharge: shippingCharge,
            total: cartTotalWithShipping
          })
        });
      } catch (emailErr) {
        console.error('Email sending failed, but order was placed:', emailErr);
      }
      
      navigate(`/order-confirmation/${order.id}`);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'PGRST205') {
        setError('Database tables not found. Please run the SQL script provided in database.sql.');
      } else {
        setError(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="font-serif text-4xl text-espresso-900 mb-8">Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-8">
            {error && (
              <div className="bg-kumkum-50 text-kumkum-700 p-4 rounded text-sm border border-kumkum-200">
                {error}
              </div>
            )}
            
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-chai-200">
              <h2 className="font-serif text-2xl text-espresso-900 mb-6 flex items-center">
                Contact & Shipping Info
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Phone Number *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Complete Delivery Address *</label>
                  <textarea name="address" required value={formData.address} onChange={handleInputChange} rows={3} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">City *</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">State *</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Pincode *</label>
                  <input type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Order Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-chai-200">
              <h2 className="font-serif text-2xl text-espresso-900 mb-6">Payment Method</h2>
              <div className="p-4 border border-marigold-500 bg-marigold-50 rounded-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-espresso-900 block">Cash on Delivery (COD)</span>
                  <span className="text-sm text-espresso-600">Pay when you receive the order</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-marigold-500 ring-2 ring-offset-2 ring-marigold-500"></div>
              </div>
              <p className="text-xs text-espresso-400 mt-4 flex items-center">
                <Lock size={12} className="mr-1" /> Online payments coming soon.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-chai-200 p-6 sticky top-24">
              <h3 className="font-serif text-xl text-espresso-900 mb-4 border-b border-chai-200 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border border-chai-200" />
                        ) : (
                          <div className="w-12 h-12 bg-chai-100 rounded border border-chai-200 flex items-center justify-center text-xs">IMG</div>
                        )}
                        <span className="absolute -top-2 -right-2 bg-espresso-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-espresso-800">{item.name}</span>
                    </div>
                    <span className="font-serif text-espresso-900 font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-chai-200 pt-4 space-y-3 mb-6 text-espresso-700 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
              </div>
              
              <div className="border-t border-chai-200 pt-4 mb-6 flex justify-between items-center text-espresso-900">
                <span className="font-bold uppercase tracking-wider">Total</span>
                <span className="font-serif text-3xl font-bold text-kumkum-600">₹{cartTotal}</span>
              </div>
              
              <button 
                type="submit"
                disabled={placing}
                className="w-full py-4 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm disabled:opacity-50"
              >
                {placing ? 'Processing...' : 'Place Order (COD)'}
              </button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}
