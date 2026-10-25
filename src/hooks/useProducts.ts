import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { fetchProducts } from '../services/productService';
import { supabase } from '../lib/supabase';

export function useProducts(includeInactive = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchProducts(includeInactive);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    load();

    // 1. Listen for Supabase Realtime changes
    const channel = supabase
      .channel('public:products:changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          load();
        }
      )
      .subscribe();

    // 2. Listen for internal app events for zero-latency UI updates
    const handleLocalUpdate = () => {
      load();
    };
    window.addEventListener('bhakt_products_changed', handleLocalUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('bhakt_products_changed', handleLocalUpdate);
    };
  }, [load]);

  return {
    products,
    loading,
    error,
    refetch: load
  };
}
