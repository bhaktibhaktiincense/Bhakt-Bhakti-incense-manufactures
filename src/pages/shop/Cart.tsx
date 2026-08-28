import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal, shippingCharge, cartTotalWithShipping } = useCart();
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="font-serif text-4xl text-espresso-900 mb-8">Your Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-chai-200">
            <ShoppingBag size={48} className="mx-auto text-chai-300 mb-4" />
            <h2 className="font-serif text-2xl text-espresso-900 mb-4">Your cart is empty</h2>
            <p className="text-espresso-600 mb-8">Looks like you haven't added any incense to your cart yet.</p>
            <Link to="/products" className="px-8 py-3 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-sm hover:bg-marigold-400 transition-colors rounded-sm inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-chai-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-chai-100 border-b border-chai-200 text-xs font-bold text-espresso-500 uppercase tracking-widest">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-chai-100">
                  {items.map(item => (
                    <motion.div layout key={item.product_id} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                        ) : (
                          <div className="w-20 h-20 bg-chai-100 rounded flex items-center justify-center text-espresso-300">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-espresso-900">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-kumkum-600 text-sm mt-1 flex items-center hover:underline"
                          >
                            <Trash2 size={14} className="mr-1" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 text-left md:text-center font-serif text-espresso-700">
                        <span className="md:hidden text-sm text-espresso-500 mr-2">Price:</span>
                        ₹{item.price}
                      </div>

                      <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                        <div className="flex items-center border border-chai-200 rounded">
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-2 text-espresso-500 hover:bg-chai-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-espresso-900 text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 text-espresso-500 hover:bg-chai-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 text-left md:text-right font-serif font-bold text-espresso-900 text-lg">
                        <span className="md:hidden text-sm text-espresso-500 mr-2">Total:</span>
                        ₹{item.price * item.quantity}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-chai-200 p-6 sticky top-24">
                <h3 className="font-serif text-xl text-espresso-900 mb-4 border-b border-chai-200 pb-4">Order Summary</h3>
                <div className="space-y-3 mb-6 text-espresso-700 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-serif">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-serif">{shippingCharge > 0 ? `₹${shippingCharge}` : 'Free'}</span>
                  </div>
                  {shippingCharge > 0 && (
                    <div className="text-xs text-marigold-600 italic">Free shipping on orders over ₹500</div>
                  )}
                </div>
                <div className="border-t border-chai-200 pt-4 mb-6 flex justify-between items-center text-espresso-900">
                  <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-serif text-2xl font-bold">₹{cartTotalWithShipping}</span>
                </div>
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest text-sm hover:bg-espresso-800 transition-colors rounded-sm"
                >
                  Proceed to Checkout
                </button>
                <div className="mt-4 text-center">
                  <Link to="/products" className="text-sm text-espresso-600 hover:text-marigold-600 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
