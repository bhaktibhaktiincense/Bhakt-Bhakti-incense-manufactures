import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { InvoiceTemplate } from '../../components/InvoiceTemplate';
import { downloadInvoicePDF } from '../../utils/invoice';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function InvoiceViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) {
      if (!user) navigate('/login');
      else navigate(-1);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Ensure user can only view their own order or admin can view any (RLS handles this)
        const { data: ord, error: ordErr } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();
          
        if (ordErr) throw ordErr;
        if (!ord) throw new Error('Order not found');
        
        setOrder(ord);
        setOrderItems(ord.order_items || []);
      } catch (err: any) {
        console.error('Error fetching order for invoice:', err);
        setError(err.message || 'Failed to load invoice.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate]);

  const handleDownload = async () => {
    if (!invoiceRef.current || !order) return;
    setGenerating(true);
    await downloadInvoicePDF(invoiceRef.current, order.id);
    setGenerating(false);
  };

  if (loading) {
    return <div className="pt-32 min-h-screen bg-chai-50 flex justify-center text-espresso-600">Loading invoice...</div>;
  }

  if (error || !order) {
    return (
      <div className="pt-32 min-h-screen bg-chai-50 flex justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded border border-red-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-espresso-900 mb-2">Error Loading Invoice</h2>
          <p className="text-espresso-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-chai-100 text-espresso-900 font-bold uppercase tracking-widest text-sm rounded hover:bg-chai-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-chai-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded shadow-sm border border-chai-200">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-espresso-600 hover:text-espresso-900 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>
          
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2 bg-marigold-500 hover:bg-marigold-400 text-espresso-900 font-bold uppercase tracking-widest text-sm rounded transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            {generating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>

        {/* Invoice Viewer container (Responsive handling for mobile viewing) */}
        <div className="w-full bg-chai-100/50 rounded shadow-sm border border-chai-200 overflow-hidden flex justify-center p-2 sm:p-8">
          <div 
            className="origin-top"
            style={{
              transform: typeof window !== 'undefined' && window.innerWidth < 850 
                ? `scale(${(window.innerWidth - 32) / 850})` 
                : 'scale(1)',
              height: typeof window !== 'undefined' && window.innerWidth < 850 
                ? `calc(1123px * ${(window.innerWidth - 32) / 850})` 
                : 'auto'
            }}
          >
            <InvoiceTemplate 
              ref={invoiceRef} 
              order={order} 
              orderItems={orderItems} 
              className="shadow-md bg-white border border-chai-200" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
