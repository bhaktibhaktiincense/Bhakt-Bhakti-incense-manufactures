import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, addDays } from 'date-fns';
import { Package, User, LogOut, FileText, Download } from 'lucide-react';
import { InvoiceTemplate } from '../../components/InvoiceTemplate';
import { downloadInvoicePDF } from '../../utils/invoice';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
        // Fetch profile
        const { data: prof, error: profErr } = await supabase.from('customer_profiles').select('*').eq('id', user.id).single();
        if (profErr && profErr.code !== 'PGRST116' && profErr.code !== 'PGRST205') throw profErr;
        if (prof) setProfile(prof);

        // Fetch orders
        const { data: ords, error: ordErr } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
        if (ordErr && ordErr.code !== 'PGRST205') throw ordErr;
        if (ords) setOrders(ords);
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

  if (!user || loading) {
    return <div className="pt-32 min-h-screen bg-chai-50 flex justify-center text-espresso-600">Loading...</div>;
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border border-chai-200 overflow-hidden flex-shrink-0 h-max">
            <div className="p-6 bg-espresso-900 text-chai-50 border-b border-espresso-800">
              <h2 className="font-serif text-xl text-marigold-400">My Account</h2>
              <p className="text-xs text-chai-300 mt-1 truncate">{user.email}</p>
            </div>
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'orders' ? 'bg-marigold-100 text-espresso-900' : 'text-espresso-700 hover:bg-chai-100'
                }`}
              >
                <Package size={18} />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'bg-marigold-100 text-espresso-900' : 'text-espresso-700 hover:bg-chai-100'
                }`}
              >
                <User size={18} />
                <span>Profile Info</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-kumkum-600 hover:bg-kumkum-50 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-serif text-3xl text-espresso-900 mb-6">Order History</h3>
                
                {orders.length === 0 ? (
                  <div className="bg-white p-10 rounded-lg shadow-sm border border-chai-200 text-center">
                    <Package size={48} className="mx-auto text-espresso-300 mb-4" />
                    <p className="text-espresso-700 font-medium mb-4">You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/products')} className="px-6 py-2 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest text-sm hover:bg-marigold-400 transition-colors rounded-sm">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-lg shadow-sm border border-chai-200 overflow-hidden">
                        <div className="bg-chai-100 p-4 border-b border-chai-200 flex flex-wrap justify-between items-center gap-4 text-sm">
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
                            <span className="font-medium text-espresso-900 font-serif">₹{order.total}</span>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Processing' || order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-marigold-200 text-marigold-900'
                            }`}>
                              {order.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-sm font-medium text-espresso-700 w-full sm:w-auto">
                            <span className="font-bold uppercase tracking-wider text-xs text-espresso-500 mr-2">Expected Delivery:</span>
                            {format(addDays(new Date(order.created_at), 8), 'MMM d, yyyy')}
                          </div>
                          <div className="flex justify-end gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => navigate(`/invoice/${order.id}`)}
                              className="flex items-center gap-2 px-4 py-2 border border-chai-200 hover:bg-chai-50 text-espresso-900 text-xs font-bold uppercase tracking-widest rounded transition-colors"
                            >
                              <FileText size={14} />
                              View Invoice
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(order.id)}
                              disabled={downloadingId === order.id}
                              className="flex items-center gap-2 px-4 py-2 bg-chai-100 hover:bg-chai-200 text-espresso-900 text-xs font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50"
                            >
                              <Download size={14} />
                              {downloadingId === order.id ? 'Generating...' : 'Download Invoice'}
                            </button>
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

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-serif text-3xl text-espresso-900 mb-6">Profile Information</h3>
                <div className="bg-white p-8 rounded-lg shadow-sm border border-chai-200">
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
