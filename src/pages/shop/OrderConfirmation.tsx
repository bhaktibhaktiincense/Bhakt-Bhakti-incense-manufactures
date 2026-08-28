import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Download, Package, ArrowRight } from 'lucide-react';
import { InvoiceTemplate } from '../../components/InvoiceTemplate';
import { downloadInvoicePDF } from '../../utils/invoice';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      navigate('/account');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data: ord, error: ordErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (ordErr) throw ordErr;
        setOrder(ord);

        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);
          
        if (itemsErr) throw itemsErr;
        setOrderItems(items || []);
      } catch (error) {
        console.error('Error fetching order:', error);
        navigate('/account');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current) return;
    setGenerating(true);
    await downloadInvoicePDF(invoiceRef.current, order.id);
    setGenerating(false);
  };

  if (loading) {
    return <div className="pt-32 min-h-screen bg-chai-50 flex justify-center text-espresso-600">Loading order details...</div>;
  }

  if (!order) return null;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm border border-chai-200 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="font-serif text-4xl text-espresso-900 mb-2">Order Confirmed!</h1>
        <p className="text-espresso-600 mb-8">
          Thank you for your purchase, {order.customer_name}. Your order has been placed successfully.
        </p>

        <div className="bg-chai-50 p-6 rounded border border-chai-200 text-left mb-8 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-chai-200">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Order Number</span>
            <span className="font-mono text-espresso-900 font-bold">{String(order.id).slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-chai-200">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Total Amount</span>
            <span className="font-serif text-lg font-bold text-espresso-900">₹{order.total}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-chai-200 mb-4">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Payment Status</span>
            <span className="bg-marigold-100 text-marigold-900 text-xs font-bold px-2 py-1 rounded">
              {order.payment_status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Expected Delivery</span>
            <span className="font-medium text-espresso-900">
              {order.created_at ? format(addDays(new Date(order.created_at), 8), 'MMMM d, yyyy') : format(addDays(new Date(), 8), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={`/invoice/${order.id}`}
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-chai-200 text-espresso-900 font-bold uppercase tracking-widest hover:bg-chai-50 transition-colors rounded-sm"
          >
            <Package size={18} />
            View Invoice
          </Link>
          <button 
            onClick={handleDownloadInvoice}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm disabled:opacity-50"
          >
            <Download size={18} />
            {generating ? 'Generating PDF...' : 'Download Invoice'}
          </button>
          
          <Link 
            to="/account"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-chai-100 text-espresso-800 font-bold uppercase tracking-widest hover:bg-chai-200 transition-colors rounded-sm"
          >
            <Package size={18} />
            View All Orders
          </Link>
        </div>
      </div>
      
      {/* Hidden Invoice Component for PDF Generation */}
      <InvoiceTemplate ref={invoiceRef} order={order} orderItems={orderItems} />
    </div>
  );
}
