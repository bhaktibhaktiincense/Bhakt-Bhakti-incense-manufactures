import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useProducts';
import ProductManagement from '../components/admin/ProductManagement';
import { WebsiteAnalytics } from '../components/admin/WebsiteAnalytics';
import { 
  LayoutDashboard, 
  BarChart3,
  MessageSquareWarning, 
  HelpCircle, 
  MessageSquareHeart,
  ShoppingCart,
  CalendarDays,
  CreditCard,
  Users,
  Mail,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Phone,
  Package,
  MessageCircle,
  ExternalLink,
  Truck,
  CheckCircle,
  MapPin
} from 'lucide-react';

export default function Admin() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard State - default to Product Management
  const [activeTab, setActiveTab] = useState('Product Management');
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Dynamic Product Management hook
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
      } else if (data?.session) {
        const returnedEmail = data.session.user.email?.toLowerCase();
        const returnedRole = data.session.user.user_metadata?.role || data.session.user.app_metadata?.role;
        const returnedIsAdmin = data.session.user.user_metadata?.is_admin === true || data.session.user.app_metadata?.is_admin === true;
        const ADMIN_EMAIL = "bbincensemanufacters@gmail.com";
        const isValidAdmin = (returnedEmail === ADMIN_EMAIL.toLowerCase()) || 
                             (returnedEmail === 'bs635379@gmail.com') || 
                             returnedIsAdmin || 
                             (returnedRole === 'admin');
        
        if (!isValidAdmin) {
          setLoginError("Access denied. Admin account required.");
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const fetchData = async () => {
    if (!session) return;
    if (activeTab === 'Product Management') {
      refetchProducts();
      return;
    }

    setIsFetching(true);
    try {
      let tableName = '';
      if (activeTab === 'Complaints') tableName = 'complaints';
      else if (activeTab === 'Product Inquiries') tableName = 'Product_Enquiries';
      else if (activeTab === 'Feedback') tableName = 'Feedback';
      else if (activeTab === 'Orders') tableName = 'orders';
      else if (activeTab === 'Messages') tableName = 'messages';
      else if (activeTab === 'Customers') tableName = 'customers';
      else if (activeTab === 'Bookings') tableName = 'bookings';
      else if (activeTab === 'Payments') tableName = 'payments';
      else if (activeTab === 'Email Notifications') tableName = 'email_notifications';
      else {
        setData([]);
        setIsFetching(false);
        return;
      }

      let query = supabase.from(tableName).select(activeTab === 'Orders' ? '*, order_items(*)' : '*').order('created_at', { ascending: false });
      
      if (activeTab === 'Orders') {
        query = query.limit(50);
      }
      
      if (statusFilter !== 'All' && tableName !== 'Feedback' && tableName !== 'customers') {
        query = query.eq('status', statusFilter);
      }
      
      const { data: result, error } = await query;
      if (error) {
        if (error.code === 'PGRST205') {
          setData([]);
          setIsFetching(false);
          return;
        }
        throw error;
      }
      
      setData(result || []);
    } catch (error: any) {
      if (error.code !== 'PGRST205') console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
      
      const fetchUnread = async () => {
        try {
          const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
          setUnreadMessages(count || 0);
        } catch {
          // ignore
        }
      };
      
      fetchUnread();
      
      let tableName = '';
      if (activeTab === 'Complaints') tableName = 'complaints';
      else if (activeTab === 'Product Inquiries') tableName = 'Product_Enquiries';
      else if (activeTab === 'Feedback') tableName = 'Feedback';
      else if (activeTab === 'Orders') tableName = 'orders';
      else if (activeTab === 'Messages') tableName = 'messages';
      else if (activeTab === 'Customers') tableName = 'customers';
      else if (activeTab === 'Bookings') tableName = 'bookings';
      else if (activeTab === 'Payments') tableName = 'payments';
      else if (activeTab === 'Email Notifications') tableName = 'email_notifications';

      if (tableName) {
        const channel = supabase.channel(`public:${tableName}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
            fetchData();
            if (tableName === 'messages') fetchUnread();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [session, activeTab, statusFilter]);

  const updateStatus = async (id: number | string, status: any, field = 'status') => {
    let tableName = '';
    if (activeTab === 'Complaints') tableName = 'complaints';
    else if (activeTab === 'Product Inquiries') tableName = 'Product_Enquiries';
    else if (activeTab === 'Orders') tableName = 'orders';
    else if (activeTab === 'Messages') tableName = 'messages';
    else if (activeTab === 'Bookings') tableName = 'bookings';
    else if (activeTab === 'Payments') tableName = 'payments';
    else return;

    try {
      const { error } = await supabase
        .from(tableName)
        .update({ [field]: status })
        .eq('id', id);
      if (error) throw error;
      
      // Update local state
      setData(data.map(item => item.id === id ? { ...item, [field]: status } : item));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-chai-50 flex items-center justify-center font-serif">Loading Admin Panel...</div>;
  }

  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
  const isUserAdmin = session?.user?.user_metadata?.is_admin === true || session?.user?.app_metadata?.is_admin === true;
  
  const ADMIN_EMAIL = "bbincensemanufacters@gmail.com";
  const isAdmin = (userEmail === ADMIN_EMAIL.toLowerCase()) || 
                  (userEmail === 'bs635379@gmail.com') || 
                  isUserAdmin || 
                  (userRole === 'admin');

  if (!session || !isAdmin) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-chai-50 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-marigold-500"
        >
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-marigold-600 uppercase tracking-widest block mb-1">
              Bhakt & Bhakti Incense
            </span>
            <h1 className="font-serif text-3xl text-espresso-900 mb-2">Admin Portal</h1>
            <p className="text-espresso-600 text-sm">Secure access to inventory, orders & inquiries</p>
          </div>
          
          {loginError && (
            <div className="bg-kumkum-50 text-kumkum-800 p-3 rounded-xl text-sm mb-6 border border-kumkum-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Admin Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bbincensemanufacters@gmail.com"
                className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm focus:border-marigold-500 focus:bg-white outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-chai-50 border border-chai-200 rounded-lg text-sm focus:border-marigold-500 focus:bg-white outline-none" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-3.5 mt-4 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest text-xs hover:bg-espresso-800 transition-colors rounded-lg disabled:opacity-50 shadow-md"
            >
              {isLoggingIn ? 'Authenticating...' : 'Login to Admin Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { name: 'Product Management', icon: Package, badge: products.length },
    { name: 'Website Analytics', icon: BarChart3 },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Product Inquiries', icon: HelpCircle },
    { name: 'Complaints', icon: MessageSquareWarning },
    { name: 'Feedback', icon: MessageSquareHeart },
    { name: 'Messages', icon: Mail },
    { name: 'Customers', icon: Users },
    { name: 'Email Notifications', icon: Mail },
  ];

  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.customer_name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.product_name?.toLowerCase().includes(q) ||
      item.order_number?.toLowerCase().includes(q) ||
      (item.id && typeof item.id === 'string' && item.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pt-24 min-h-screen bg-chai-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-espresso-900 text-chai-50 flex-shrink-0 md:min-h-[calc(100vh-6rem)] flex flex-col">
        <div className="p-6 border-b border-espresso-800">
          <span className="text-[10px] uppercase tracking-widest text-marigold-400 font-bold block mb-1">
            Manufacturing & Store
          </span>
          <h2 className="font-serif text-xl font-bold text-white">Bhakt & Bhakti</h2>
          <p className="text-xs text-chai-300 mt-1 truncate">{session.user.email}</p>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[60vh] md:max-h-none flex-1">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.name 
                  ? 'bg-marigold-500 text-espresso-900 shadow-md font-bold' 
                  : 'text-chai-200 hover:bg-espresso-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <tab.icon size={17} />
                <span>{tab.name}</span>
              </div>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.name ? 'bg-espresso-900 text-marigold-400' : 'bg-espresso-800 text-chai-200'
                }`}>
                  {tab.badge}
                </span>
              )}
              {tab.name === 'Messages' && unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-espresso-800 mt-auto hidden md:block">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-kumkum-300 hover:text-kumkum-100 hover:bg-espresso-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="font-serif text-3xl text-espresso-900 font-bold mb-1">{activeTab}</h1>
            <p className="text-espresso-600 text-xs">
              {activeTab === 'Product Management' && 'Manage live agarbatti listings, inventory, pricing & images'}
              {activeTab === 'Website Analytics' && 'Real-time visitor behaviour, funnel conversions, and catalog performance'}
              {activeTab === 'Orders' && 'Manage customer orders, track Cash on Delivery shipments, and generate invoices'}
              {activeTab !== 'Product Management' && activeTab !== 'Website Analytics' && activeTab !== 'Orders' && `Manage your ${activeTab.toLowerCase()}`}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab !== 'Website Analytics' && (
              <button 
                onClick={activeTab === 'Product Management' ? refetchProducts : fetchData}
                disabled={isFetching || productsLoading}
                className="p-2.5 bg-white text-espresso-700 rounded-lg border border-chai-200 hover:bg-chai-50 transition-colors shadow-sm flex items-center gap-2 text-xs font-bold"
                title="Refresh Data"
              >
                <RefreshCw size={16} className={(isFetching || productsLoading) ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="md:hidden px-4 py-2 bg-espresso-900 text-chai-50 rounded-lg text-xs font-bold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Product Management' ? (
          <ProductManagement
            products={products}
            isLoading={productsLoading}
            onRefresh={refetchProducts}
          />
        ) : activeTab === 'Website Analytics' ? (
          <WebsiteAnalytics products={products} />
        ) : ['Complaints', 'Product Inquiries', 'Feedback', 'Orders', 'Messages', 'Customers', 'Email Notifications'].includes(activeTab) ? (
          <div className="bg-white rounded-2xl shadow-sm border border-chai-200 overflow-hidden">
            {/* Search and Filter Strip */}
            <div className="p-4 border-b border-chai-200 bg-chai-50 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-espresso-400" size={16} />
                <input 
                  type="text" 
                  placeholder={`Search in ${activeTab}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-chai-200 rounded-lg text-xs focus:outline-none focus:border-marigold-500 bg-white"
                />
              </div>
              
              {activeTab !== 'Feedback' && activeTab !== 'Customers' && activeTab !== 'Email Notifications' && (
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-espresso-500" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-chai-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-marigold-500 bg-white"
                  >
                    <option value="All">All Statuses</option>
                    {activeTab === 'Orders' ? (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    ) : activeTab === 'Complaints' ? (
                      <>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </>
                    ) : (
                      <>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-chai-100/80 text-espresso-900 uppercase font-bold tracking-wider border-b border-chai-200">
                    <th className="p-4 font-bold">Date & ID</th>
                    <th className="p-4 font-bold">
                      {activeTab === 'Customers' ? 'Customer Details' :
                       activeTab === 'Email Notifications' ? 'Recipient Info' : 'Customer & Delivery'}
                    </th>
                    <th className="p-4 font-bold">
                      {activeTab === 'Feedback' ? 'Rating' : 
                       activeTab === 'Orders' ? 'Ordered Offerings' : 
                       'Subject & Message'}
                    </th>
                    <th className="p-4 font-bold">
                      {activeTab === 'Orders' ? 'Total & Payment' : 
                       activeTab === 'Customers' ? 'Address/Info' :
                       'Details'}
                    </th>
                    {activeTab !== 'Feedback' && activeTab !== 'Customers' && <th className="p-4 font-bold text-center">Status & Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-chai-100">
                  {isFetching ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-espresso-500">Loading {activeTab}...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-espresso-500">
                        {searchQuery || statusFilter !== 'All' ? 'No matching records found.' : `No ${activeTab.toLowerCase()} recorded yet.`}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-chai-50/50 transition-colors">
                        
                        {/* Column 1: Date & ID */}
                        <td className="p-4 align-top whitespace-nowrap">
                          <span className="font-bold text-espresso-900 block">
                            {item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : 'N/A'}
                          </span>
                          <span className="text-[10px] text-espresso-400 block mt-0.5">
                            {item.created_at ? format(new Date(item.created_at), 'h:mm a') : ''}
                          </span>

                          {activeTab === 'Orders' && (
                            <div className="mt-2 text-[10px] font-mono font-bold text-espresso-900 bg-chai-100 px-2 py-0.5 rounded border border-chai-200 inline-block">
                              {item.order_number || (typeof item.id === 'string' && item.id.startsWith('BB-ORD') ? item.id : `#${String(item.id).slice(0, 8).toUpperCase()}`)}
                            </div>
                          )}
                        </td>

                        {/* Column 2: Customer Details */}
                        <td className="p-4 align-top">
                          <div className="font-bold text-espresso-900 text-sm mb-1">
                            {item.customer_name || item.name || 'Valued Devotee'}
                          </div>
                          
                          {item.phone && (
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <a href={`tel:${item.phone}`} className="text-espresso-700 hover:text-kumkum-600 font-bold flex items-center gap-1 text-xs">
                                <Phone size={12} /> {item.phone}
                              </a>
                              <a 
                                href={`https://wa.me/91${item.phone.replace(/\D/g, '')}?text=Namaste%20${encodeURIComponent(item.customer_name || 'Customer')},%20regarding%20your%20Bhakt%20%26%20Bhakti%20order...`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <MessageCircle size={10} /> WhatsApp
                              </a>
                            </div>
                          )}

                          {item.email && (
                            <div className="text-[11px] text-espresso-500 mt-1 flex items-center gap-1">
                              <Mail size={11} /> {item.email}
                            </div>
                          )}

                          {activeTab === 'Orders' && item.shipping_address && (
                            <div className="text-[11px] text-espresso-700 mt-2 p-2 bg-white rounded-lg border border-chai-200 whitespace-pre-wrap leading-relaxed">
                              <MapPin size={11} className="inline mr-1 text-kumkum-600" />
                              {item.shipping_address}
                            </div>
                          )}
                        </td>

                        {/* Column 3: Ordered Offerings / Subject */}
                        <td className="p-4 align-top">
                          {activeTab === 'Orders' ? (
                            <div className="space-y-1.5">
                              {item.order_items && item.order_items.length > 0 ? (
                                item.order_items.map((oi: any) => (
                                  <div key={oi.id || oi.product_id} className="text-xs text-espresso-800 flex items-center gap-2">
                                    <span className="font-bold bg-chai-100 text-espresso-900 px-1.5 py-0.5 rounded text-[10px]">
                                      {oi.quantity}x
                                    </span>
                                    <span className="font-medium">{oi.product_name || oi.name}</span>
                                    <span className="text-[10px] text-espresso-400">@ ₹{oi.price}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-espresso-500 italic text-[11px]">Details in invoice</span>
                              )}
                            </div>
                          ) : activeTab === 'Feedback' ? (
                            <div>
                              <div className="flex gap-1 text-marigold-500 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className="text-base">{i < (item.rating || 0) ? '★' : '☆'}</span>
                                ))}
                              </div>
                              <p className="text-xs text-espresso-700">{item.message}</p>
                            </div>
                          ) : (
                            <div>
                              <strong className="block text-espresso-900 mb-1">{item.subject || item.product_name || 'Inquiry'}</strong>
                              <p className="text-espresso-700 whitespace-pre-wrap">{item.message}</p>
                            </div>
                          )}
                        </td>

                        {/* Column 4: Total & Payment */}
                        <td className="p-4 align-top whitespace-nowrap">
                          {activeTab === 'Orders' ? (
                            <div>
                              <span className="font-serif text-lg font-bold text-kumkum-600 block">
                                ₹{item.total}
                              </span>
                              <span className="text-[10px] text-espresso-600 uppercase font-bold block mt-0.5">
                                {item.payment_method || 'COD'}
                              </span>
                              <span className="text-[10px] text-espresso-400 block">
                                {item.payment_status || 'Pending'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-espresso-500 text-xs">Standard</span>
                          )}
                        </td>

                        {/* Column 5: Status Dropdown & Invoice Link */}
                        {activeTab !== 'Feedback' && activeTab !== 'Customers' && (
                          <td className="p-4 align-top text-center whitespace-nowrap">
                            <div className="flex flex-col gap-2 items-center">
                              <select
                                value={item.status || 'Pending'}
                                onChange={(e) => updateStatus(item.id, e.target.value)}
                                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                                  item.status === 'Delivered' || item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                  item.status === 'Cancelled' || item.status === 'Rejected' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                  item.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  item.status === 'Processing' || item.status === 'Confirmed' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                  'bg-amber-100 text-amber-800 border-amber-300'
                                }`}
                              >
                                {activeTab === 'Orders' ? (
                                  <>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Rejected">Rejected</option>
                                  </>
                                )}
                              </select>

                              {activeTab === 'Orders' && (
                                <Link 
                                  to={`/invoice/${item.id ?? item.order_number}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold px-2.5 py-1 bg-white hover:bg-chai-100 text-espresso-800 border border-chai-200 rounded transition-colors flex items-center gap-1 shadow-xs"
                                >
                                  <ExternalLink size={11} /> Print Invoice
                                </Link>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-chai-200 p-12 text-center shadow-sm">
            <LayoutDashboard size={40} className="mx-auto text-espresso-400 mb-3" />
            <h3 className="font-serif text-2xl text-espresso-900 mb-1">{activeTab}</h3>
            <p className="text-espresso-600 text-xs max-w-sm mx-auto">
              Please choose Product Management or Orders from the sidebar menu to manage your live agarbatti operations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
