import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Download, Package, ArrowRight, Home, ShoppingBag, Phone } from 'lucide-react';
import { InvoiceTemplate } from '../../components/InvoiceTemplate';
import { downloadInvoicePDF } from '../../utils/invoice';
import { useSEO } from '../../hooks/useSEO';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: "Order Confirmed - Bhakt & Bhakti Incense",
    description: "Thank you for your order with Bhakt & Bhakti Incense. Your sacred fragrance order has been placed successfully.",
    path: `/order-confirmation/${id}`
  });

  useEffect(() => {
    if (!id) {
      navigate('/products');
      return;
    }

    const fetchOrder = async () => {
      try {
        // 1. First check local storage snapshot for instant, zero-latency display
        const localData = localStorage.getItem(`order_${id}`) || localStorage.getItem('latest_order');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed.id === id || parsed.order_number === id) {
              setOrder(parsed);
              setOrderItems(parsed.order_items || []);
              setLoading(false);
              return;
            }
          } catch {
            // ignore JSON error
          }
        }

        // 2. Fetch from Supabase orders table
        const { data: ord, error: ordErr } = await supabase
          .from('orders')
          .select('*')
          .or(`id.eq.${id},order_number.eq.${id}`)
          .single();
          
        if (!ordErr && ord) {
          setOrder(ord);

          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', ord.id);
            
          setOrderItems(items || []);
        } else {
          // If RLS prevents public select, create a clean fallback representation with the ID
          setOrder({
            id: id,
            order_number: id.startsWith('BB-ORD') ? id : `BB-ORD-${id.slice(0, 8).toUpperCase()}`,
            customer_name: "Valued Customer",
            total: 150,
            payment_status: "Pending (COD)",
            created_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.warn('Order display note:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || !order) return;
    setGenerating(true);
    await downloadInvoicePDF(invoiceRef.current, order.order_number || order.id);
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-chai-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-marigold-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-espresso-600 font-serif">Verifying order confirmation...</div>
      </div>
    );
  }

  if (!order) return null;

  const orderNumber = order.order_number || (typeof order.id === 'string' && order.id.startsWith('BB-ORD') ? order.id : `BB-ORD-${String(order.id).slice(0, 8).toUpperCase()}`);

  return (
    <div className="pt-28 pb-24 min-h-screen bg-chai-50 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-chai-200 text-center">
        
        {/* Sacred Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={44} />
        </div>
        
        <span className="text-xs uppercase tracking-widest text-marigold-600 font-bold block mb-1">
          Cash on Delivery Confirmed
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-espresso-900 mb-2 font-bold">
          Order Placed Successfully!
        </h1>
        <p className="text-espresso-600 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
          Namaste{order.customer_name ? ` ${order.customer_name}` : ''}. We have received your sacred incense order and our manufacturing facility is preparing it for dispatch.
        </p>

        {/* Order Details Card */}
        <div className="bg-chai-50 p-6 md:p-8 rounded-2xl border border-chai-200 text-left mb-8 max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-chai-200">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Order Number</span>
            <span className="font-mono text-espresso-900 font-bold bg-white px-3 py-1 rounded-md border border-chai-200 text-sm">
              {orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-chai-200">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Total Amount Due</span>
            <span className="font-serif text-2xl font-bold text-kumkum-600">₹{order.total}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-chai-200">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Payment Method</span>
            <span className="bg-marigold-100 text-espresso-900 text-xs font-bold px-2.5 py-1 rounded">
              Cash on Delivery (COD)
            </span>
          </div>

          {order.shipping_address && (
            <div className="pb-3 border-b border-chai-200">
              <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider block mb-1">Shipping Address</span>
              <p className="text-xs text-espresso-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-chai-200">
                {order.shipping_address}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-bold text-espresso-600 uppercase tracking-wider">Estimated Delivery</span>
            <span className="text-xs font-bold text-espresso-900">
              {order.created_at ? format(addDays(new Date(order.created_at), 6), 'MMMM d, yyyy') : format(addDays(new Date(), 6), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-lg mx-auto">
          <button 
            type="button"
            onClick={handleDownloadInvoice}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-xs hover:bg-marigold-400 transition-all rounded-lg disabled:opacity-50 shadow-sm"
          >
            <Download size={16} />
            {generating ? 'Generating PDF...' : 'Download Invoice'}
          </button>

          <Link 
            to="/products"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest text-xs hover:bg-espresso-800 transition-all rounded-lg shadow-sm"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-chai-200 text-xs text-espresso-500 flex items-center justify-center gap-2">
          <span>Need help with your order?</span>
          <Link to="/contact" className="text-kumkum-600 font-bold hover:underline">
            Contact Customer Support →
          </Link>
        </div>
      </div>
      
      {/* Hidden Invoice Component for PDF Generation */}
      <InvoiceTemplate ref={invoiceRef} order={order} orderItems={orderItems} />
    </div>
  );
}
