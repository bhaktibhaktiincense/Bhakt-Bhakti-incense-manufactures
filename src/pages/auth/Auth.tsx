import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Auth({ type = 'login' }: { type?: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        
        // Also create a record in customer_profiles table if needed, 
        // but Supabase triggers can do this. 
        if (data.user) {
          const { error: profileError } = await supabase
            .from('customer_profiles')
            .upsert([{ id: data.user.id, name, email, phone: '' }]);
          
          if (profileError && profileError.code !== 'PGRST205') {
            console.error('Profile creation error:', profileError);
          }
        }

        alert('Signup successful! You are now logged in.');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-chai-50 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md border-t-4 border-marigold-500"
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-espresso-900 mb-2">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-espresso-600 text-sm">
            {type === 'login' ? 'Login to your customer account' : 'Join Bhakt & Bhakti to shop securely'}
          </p>
        </div>
        
        {error && (
          <div className="bg-kumkum-50 text-kumkum-700 p-3 rounded text-sm mb-6 border border-kumkum-200">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-espresso-900 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-chai-50 border border-chai-200 rounded-sm focus:border-marigold-500 focus:ring-1 focus:ring-marigold-500 outline-none" 
              />
            </div>
          )}
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
            disabled={loading}
            className="w-full py-3 mt-4 bg-marigold-500 text-espresso-900 font-bold uppercase tracking-widest hover:bg-marigold-400 transition-colors rounded-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : (type === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-espresso-600">
          {type === 'login' ? (
            <p>Don't have an account? <Link to="/signup" className="text-kumkum-600 font-bold hover:underline">Sign up</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login" className="text-kumkum-600 font-bold hover:underline">Login</Link></p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
