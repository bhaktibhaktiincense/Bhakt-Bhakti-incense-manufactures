import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
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
  Phone
} from 'lucide-react';

export default function Admin() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState('Complaints');
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unreadMessages, setUnreadMessages] = useState(0);



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
        const isValidAdmin = (returnedEmail === ADMIN_EMAIL.toLowerCase()) || returnedIsAdmin || (returnedRole === 'admin');
        
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
        const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
        setUnreadMessages(count || 0);
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

        // Also listen to messages globally if not on the messages tab
        const globalMessagesChannel = tableName !== 'messages' 
          ? supabase.channel('global:messages')
              .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchUnread();
              })
              .subscribe()
          : null;

        return () => {
          supabase.removeChannel(channel);
          if (globalMessagesChannel) supabase.removeChannel(globalMessagesChannel);
        };
      } else {
        const globalMessagesChannel = supabase.channel('global:messages')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
            fetchUnread();
          })
          .subscribe();
          
        return () => {
          supabase.removeChannel(globalMessagesChannel);
        }
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
    return <div className="min-h-screen bg-chai-50 flex items-center justify-center">Loading...</div>;
  }

  const userEmail = session?.user?.email?.toLowerCase();
  const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
  const isUserAdmin = session?.user?.user_metadata?.is_admin === true || session?.user?.app_metadata?.is_admin === true;
  
  const ADMIN_EMAIL = "bbincensemanufacters@gmail.com";
  const isAdmin = (userEmail === ADMIN_EMAIL.toLowerCase()) || isUserAdmin || (userRole === 'admin');

  if (!session || !isAdmin) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-chai-50 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md border-t-4 border-marigold-500"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-espresso-900 mb-2">Admin Login</h1>
            <p className="text-espresso-600 text-sm">Secure access to Bhakt & Bhakti dashboard</p>
          </div>
          
          {loginError && (
            <div className="bg-kumkum-50 text-kumkum-700 p-3 rounded text-sm mb-6 border border-kumkum-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-3 mt-4 bg-espresso-900 text-chai-50 font-bold uppercase tracking-widest hover:bg-espresso-800 transition-colors rounded-sm disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Bookings', icon: CalendarDays },
    { name: 'Product Inquiries', icon: HelpCircle },
    { name: 'Complaints', icon: MessageSquareWarning },
    { name: 'Feedback', icon: MessageSquareHeart },
    { name: 'Messages', icon: Mail },
    { name: 'Payments', icon: CreditCard },
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
      (item.id && typeof item.id === 'string' && item.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pt-24 min-h-screen bg-chai-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-espresso-900 text-chai-50 flex-shrink-0 md:min-h-[calc(100vh-6rem)]">
        <div className="p-6 border-b border-espresso-800">
          <h2 className="font-serif text-xl text-marigold-400">Admin Panel</h2>
          <p className="text-xs text-chai-300 mt-1">{session.user.email}</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[60vh] md:max-h-none">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.name 
                  ? 'bg-marigold-500 text-espresso-900' 
                  : 'text-chai-200 hover:bg-espresso-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </div>
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
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-kumkum-300 hover:text-kumkum-100 hover:bg-espresso-800 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl text-espresso-900 mb-1">{activeTab}</h1>
            <p className="text-espresso-600 text-sm">Manage your {activeTab.toLowerCase()}</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={fetchData}
              disabled={isFetching}
              className="p-2 bg-white text-espresso-600 rounded border border-chai-200 hover:bg-chai-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleLogout}
              className="md:hidden px-4 py-2 bg-espresso-900 text-chai-50 rounded text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {['Complaints', 'Product Inquiries', 'Feedback', 'Orders', 'Messages', 'Customers', 'Bookings', 'Payments', 'Email Notifications'].includes(activeTab) ? (
          <div className="bg-white rounded-lg shadow-sm border border-chai-200 overflow-hidden">
            <div className="p-4 border-b border-chai-200 bg-chai-50 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-espresso-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-chai-200 rounded text-sm focus:outline-none focus:border-marigold-500"
                />
              </div>
              
              {activeTab !== 'Feedback' && activeTab !== 'Customers' && activeTab !== 'Email Notifications' && activeTab !== 'Payments' && (
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-espresso-500" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-chai-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-marigold-500 bg-white"
                  >
                    <option value="All">All Statuses</option>
                    {activeTab === 'Complaints' ? (
                      <>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </>
                    ) : activeTab === 'Orders' ? (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    ) : activeTab === 'Messages' ? (
                      <>
                        <option value="New">New</option>
                        <option value="Read">Read</option>
                        <option value="Resolved">Resolved</option>
                      </>
                    ) : activeTab === 'Bookings' ? (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </>
                    ) : (
                      <>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-chai-100 text-espresso-800 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Date / ID</th>
                    <th className="p-4 font-bold">
                      {activeTab === 'Customers' ? 'Customer Info' :
                       activeTab === 'Email Notifications' ? 'Recipient Info' : 'Customer Info'}
                    </th>
                    <th className="p-4 font-bold">
                      {activeTab === 'Feedback' ? 'Rating' : 
                       activeTab === 'Orders' ? 'Order Summary' : 
                       activeTab === 'Bookings' ? 'Booking Details' :
                       activeTab === 'Payments' ? 'Payment Details' :
                       activeTab === 'Email Notifications' ? 'Event & Details' :
                       'Subject/Product'}
                    </th>
                    <th className="p-4 font-bold">
                      {activeTab === 'Orders' ? 'Total & Payment' : 
                       activeTab === 'Customers' ? 'Address/Info' :
                       activeTab === 'Bookings' || activeTab === 'Payments' ? 'Additional Info' :
                       activeTab === 'Email Notifications' ? 'Provider ID' :
                       'Message'}
                    </th>
                    {activeTab !== 'Feedback' && activeTab !== 'Customers' && <th className="p-4 font-bold">Status</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-chai-100">
                  {isFetching ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-espresso-500">Loading data...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-espresso-500">
                        {searchQuery || statusFilter !== 'All' ? 'No matching records found.' : 'No records yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-chai-50/50 transition-colors">
                        <td className="p-4 text-sm text-espresso-600 whitespace-nowrap align-top">
                          {item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : 'N/A'}
                          <div className="text-xs text-espresso-400 mt-1">
                            {item.created_at ? format(new Date(item.created_at), 'h:mm a') : ''}
                          </div>
                          {activeTab === 'Orders' && item.id && (
                            <div className="mt-2 text-xs font-mono font-bold text-espresso-900 bg-chai-100 px-1 py-0.5 rounded inline-block">
                              {String(item.id).slice(0, 8).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-bold text-espresso-900 text-sm mb-1">
                            {activeTab === 'Email Notifications' ? item.recipient : (item.name || item.customer_name || 'Anonymous')}
                          </div>
                          {item.phone && <div className="text-xs text-espresso-600 flex items-center gap-1"><Phone size={12}/> {item.phone}</div>}
                          {item.email && <div className="text-xs text-espresso-600 flex items-center gap-1 mt-1"><Mail size={12}/> {item.email}</div>}
                          {activeTab === 'Orders' && item.shipping_address && (
                            <div className="text-xs text-espresso-600 mt-2 p-2 bg-chai-50 rounded whitespace-pre-wrap">
                              {item.shipping_address}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          {activeTab === 'Feedback' ? (
                            <div className="flex gap-1 text-marigold-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="text-sm">{i < (item.rating || 0) ? '★' : '☆'}</span>
                              ))}
                            </div>
                          ) : activeTab === 'Orders' ? (
                            <div className="space-y-2">
                              {item.order_items?.map((oi: any) => (
                                <div key={oi.id} className="text-sm text-espresso-800">
                                  <span className="font-bold">{oi.quantity}x</span> {oi.product_name}
                                </div>
                              ))}
                            </div>
                          ) : activeTab === 'Bookings' ? (
                            <div className="text-sm text-espresso-800">
                               <div className="font-bold">{item.service || 'Consultation'}</div>
                               <div className="text-xs mt-1 text-espresso-600">
                                  {item.booking_date && format(new Date(item.booking_date), 'MMM d, yyyy')}
                                  {item.booking_time && ` at ${item.booking_time}`}
                               </div>
                            </div>
                          ) : activeTab === 'Payments' ? (
                            <div className="text-sm text-espresso-800">
                               <div className="font-serif text-lg font-bold">₹{item.amount} {item.currency}</div>
                               <div className="text-xs mt-1 text-espresso-600">{item.provider}</div>
                            </div>
                          ) : activeTab === 'Email Notifications' ? (
                            <div className="text-sm text-espresso-800">
                               <strong>{item.event_type}</strong>
                               <div className="mt-1">{item.subject}</div>
                            </div>
                          ) : activeTab === 'Customers' ? (
                            <div className="text-sm text-espresso-800">
                               Registered User
                            </div>
                          ) : (
                            <div className="text-sm text-espresso-800 font-medium line-clamp-2">
                              {item.subject || item.product_name || 'N/A'}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-top max-w-xs">
                          {activeTab === 'Orders' ? (
                            <div>
                              <div className="font-serif text-lg font-bold text-espresso-900">₹{item.total}</div>
                              <div className="text-xs mt-1 text-espresso-600">Payment: <span className="font-bold">{item.payment_method}</span> ({item.payment_status})</div>
                              {item.order_notes && (
                                <div className="text-xs mt-2 italic text-espresso-500 border-l-2 border-chai-200 pl-2">"{item.order_notes}"</div>
                              )}
                            </div>
                          ) : activeTab === 'Email Notifications' ? (
                            <div className="text-sm text-espresso-700 whitespace-pre-wrap">
                              {item.provider_message_id || 'N/A'}
                              {item.error_message && (
                                 <div className="text-red-600 mt-1 font-bold">{item.error_message}</div>
                              )}
                            </div>
                          ) : activeTab === 'Payments' ? (
                            <div className="text-sm text-espresso-700">
                              <div>ID: <span className="font-mono">{item.payment_id || 'N/A'}</span></div>
                              <div>Method: <strong>{item.method || item.payment_method || 'N/A'}</strong></div>
                            </div>
                          ) : activeTab === 'Bookings' ? (
                            <div className="text-sm text-espresso-700 whitespace-pre-wrap">
                              {item.notes || item.message || 'No additional details.'}
                            </div>
                          ) : activeTab === 'Customers' ? (
                            <div className="text-sm text-espresso-700 whitespace-pre-wrap">
                              {item.address || 'No address provided.'}
                            </div>
                          ) : (
                            <div className="text-sm text-espresso-700 whitespace-pre-wrap">
                              {item.message || 'No details provided.'}
                            </div>
                          )}
                        </td>
                        {activeTab !== 'Feedback' && activeTab !== 'Customers' && (
                          <td className="p-4 align-top whitespace-nowrap">
                            {activeTab === 'Email Notifications' || activeTab === 'Payments' ? (
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border outline-none inline-block ${
                                item.status?.toLowerCase() === 'success' || item.status?.toLowerCase() === 'completed' || item.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                item.status?.toLowerCase() === 'failed' || item.status?.toLowerCase() === 'bounced' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                {item.status || 'Unknown'}
                              </span>
                            ) : (
                              <div className="flex flex-col gap-2 items-start">
                                <select
                                  value={item.status || 'New'}
                                  onChange={(e) => updateStatus(item.id, e.target.value)}
                                  className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border outline-none cursor-pointer ${
                                    item.status === 'Resolved' || item.status === 'Converted' || item.status === 'Delivered' || item.status === 'Read' || item.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                    item.status === 'Rejected' || item.status === 'Closed' || item.status === 'Cancelled' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                    item.status === 'In Progress' || item.status === 'Contacted' || item.status === 'Shipped' || item.status === 'Processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-marigold-100 text-marigold-800 border-marigold-200'
                                  }`}
                                >
                                  {activeTab === 'Complaints' ? (
                                    <>
                                      <option value="New">New</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Resolved">Resolved</option>
                                      <option value="Rejected">Rejected</option>
                                    </>
                                  ) : activeTab === 'Orders' ? (
                                    <>
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </>
                                  ) : activeTab === 'Messages' ? (
                                    <>
                                      <option value="New">New</option>
                                      <option value="Read">Read</option>
                                      <option value="Resolved">Resolved</option>
                                    </>
                                  ) : activeTab === 'Bookings' ? (
                                    <>
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Cancelled">Cancelled</option>
                                      <option value="Completed">Completed</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="New">New</option>
                                      <option value="Contacted">Contacted</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Converted">Converted</option>
                                      <option value="Closed">Closed</option>
                                    </>
                                  )}
                                </select>
                                {activeTab === 'Orders' && (
                                  <Link 
                                    to={`/invoice/${item.id}`}
                                    className="text-xs px-2 py-1 bg-marigold-50 text-marigold-700 hover:bg-marigold-100 border border-marigold-200 rounded transition-colors whitespace-nowrap text-center w-full block mt-1"
                                  >
                                    View Invoice
                                  </Link>
                                )}
                                {activeTab === 'Messages' && (
                                  <button
                                    onClick={() => updateStatus(item.id, !item.is_read, 'is_read')}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                                      item.is_read ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'
                                    }`}
                                  >
                                    {item.is_read ? 'Mark Unread' : 'Mark Read'}
                                  </button>
                                )}
                              </div>
                            )}
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
          <div className="bg-white rounded-lg shadow-sm border border-chai-200 p-12 text-center">
            <div className="w-16 h-16 bg-chai-100 rounded-full flex items-center justify-center mx-auto mb-4 text-espresso-400">
              <LayoutDashboard size={32} />
            </div>
            <h3 className="font-serif text-2xl text-espresso-900 mb-2">{activeTab}</h3>
            <p className="text-espresso-600 max-w-md mx-auto">
              This module is currently being set up. Check back later for {activeTab.toLowerCase()} data integration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
