import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { InvoiceTemplate } from '../../components/InvoiceTemplate';
import { downloadInvoicePDF } from '../../utils/invoice';
import { ArrowLeft, Download, Printer, AlertCircle, Search, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSEO } from '../../hooks/useSEO';

export default function InvoiceViewer() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Support both /invoice/:id and query params (/invoice?id=... or /invoices?id=...)
  const targetId = paramId || searchParams.get('id') || searchParams.get('order_id') || searchParams.get('order');

  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lookupInput, setLookupInput] = useState('');

  const invoiceRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: order ? `Invoice #${order.order_number || order.id} - Bhakt & Bhakti Incense` : 'Tax Invoice - Bhakt & Bhakti Incense',
    description: 'Official tax invoice for your Bhakt & Bhakti Incense sacred fragrance order.',
    path: targetId ? `/invoice/${targetId}` : '/invoices'
  });

  useEffect(() => {
    // If auth is still initializing, wait
    if (authLoading) return;

    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        let ord: any = null;
        let items: any[] = [];

        // 1. Check if ID is integer
        const isNumeric = /^\d+$/.test(String(targetId).trim());

        if (isNumeric) {
          const { data, error: numErr } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', Number(targetId))
            .maybeSingle();

          if (!numErr && data) {
            ord = data;
          }
        }

        // 2. If not found by numeric ID, check by order_number
        if (!ord) {
          const { data, error: numStrErr } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('order_number', String(targetId).trim())
            .maybeSingle();

          if (!numStrErr && data) {
            ord = data;
          }
        }

        // 3. Fallback: Check local storage snapshot (e.g. recent customer order)
        if (!ord) {
          try {
            const cached = localStorage.getItem(`order_${targetId}`) || localStorage.getItem('latest_order');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (String(parsed.id) === String(targetId) || parsed.order_number === targetId) {
                ord = parsed;
                items = parsed.order_items || [];
              }
            }
          } catch {
            // ignore localStorage parsing errors
          }
        }

        if (!ord) {
          throw new Error(`Order "${targetId}" could not be found. Please verify the order number.`);
        }

        // 4. Resolve items
        if (ord.order_items && ord.order_items.length > 0) {
          items = ord.order_items;
        } else if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
          items = ord.items;
        } else if (ord.id) {
          // Explicit query for items if relation was empty
          const { data: directItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', ord.id);
          if (directItems && directItems.length > 0) {
            items = directItems;
          }
        }

        setOrder(ord);
        setOrderItems(items);
      } catch (err: any) {
        console.error('Error fetching order for invoice:', err);
        setError(err.message || 'Failed to load invoice from the database.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [targetId, authLoading]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!invoiceRef.current || !order) return;
    setGenerating(true);
    try {
      await downloadInvoicePDF(invoiceRef.current, order.order_number || order.id);
    } finally {
      setGenerating(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupInput.trim()) {
      navigate(`/invoice/${lookupInput.trim()}`);
    }
  };

  // State: Auth or data initializing
  if (authLoading || (loading && targetId)) {
    return (
      <div className="pt-32 min-h-screen bg-chai-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-marigold-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-espresso-700 font-serif text-lg">Loading invoice details...</div>
      </div>
    );
  }

  // State: No ID specified in URL (e.g. visiting /invoices or /invoice directly)
  if (!targetId) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-chai-50 flex justify-center px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-chai-200 text-center">
          <FileText className="w-12 h-12 text-marigold-500 mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-espresso-900 mb-2">Invoice Lookup</h2>
          <p className="text-espresso-600 text-xs mb-6">
            Enter an Order ID or Order Reference Number to open and print the tax invoice.
          </p>

          <form onSubmit={handleLookupSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400" size={16} />
              <input
                type="text"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="e.g. 2 or BB-ORD-..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-chai-50 border border-chai-200 rounded-lg focus:outline-none focus:border-marigold-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-espresso-900 hover:bg-espresso-800 text-chai-50 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors"
            >
              Open Invoice
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-chai-100 flex justify-center gap-4 text-xs font-bold">
            <button
              onClick={() => navigate('/admin')}
              className="text-espresso-600 hover:text-espresso-900"
            >
              Go to Admin Panel
            </button>
            <span className="text-chai-300">|</span>
            <button
              onClick={() => navigate('/account')}
              className="text-espresso-600 hover:text-espresso-900"
            >
              My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State: Error loading invoice
  if (error || !order) {
    return (
      <div className="pt-32 min-h-screen bg-chai-50 flex justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-espresso-900 mb-2">Invoice Not Found</h2>
          <p className="text-espresso-600 text-xs mb-6">{error || 'Unable to locate order in the database.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-chai-100 text-espresso-900 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-chai-200 transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => navigate('/admin')}
              className="px-5 py-2.5 bg-espresso-900 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-espresso-800 transition-colors"
            >
              Admin Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-chai-50 print-clean">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 print-clean">
        
        {/* Actions Bar (Hidden automatically when printing) */}
        <div className="no-print flex flex-wrap justify-between items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-chai-200">
          <button 
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/admin');
            }}
            className="flex items-center gap-2 text-espresso-700 hover:text-espresso-900 font-bold text-xs uppercase tracking-wider transition-colors px-3 py-2 rounded-lg hover:bg-chai-50"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          
          <div className="flex items-center gap-3">
            {/* Primary Print Button: Uses Native Browser Print Dialog (Save to PDF / Physical Printer) */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-espresso-900 hover:bg-espresso-800 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors shadow-sm"
              title="Open browser print dialog or Save as PDF"
            >
              <Printer size={15} />
              Print Invoice
            </button>

            {/* Secondary Direct PDF Download */}
            <button
              onClick={handleDownload}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 bg-marigold-500 hover:bg-marigold-400 text-espresso-900 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              title="Download high-resolution PDF directly"
            >
              <Download size={15} />
              {generating ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Invoice Viewer Document Container */}
        <div className="w-full bg-white rounded-xl shadow-md border border-chai-200 overflow-hidden flex justify-center p-2 sm:p-6 print-clean">
          <div 
            className="origin-top print-clean"
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
            />
          </div>
        </div>

      </div>
    </div>
  );
}
