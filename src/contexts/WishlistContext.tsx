import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getOrCreateVisitorId } from '../utils/analytics';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  isLiked: (productId: string) => boolean;
  getLikeCount: (productId: string) => number;
  toggleLike: (productId: string) => Promise<boolean>;
  fetchProductLikeData: (productId: string) => Promise<{ likeCount: number; isLiked: boolean }>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bb_wishlist_ids';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Sync state to local storage for guest persistence
  const saveLocalWishlist = (ids: string[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  };

  // Fetch user wishlist on authentication change
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const vid = getOrCreateVisitorId();
      try {
        const query = user?.id ? `user_id=${encodeURIComponent(user.id)}` : `visitor_id=${encodeURIComponent(vid)}`;
        const resp = await fetch(`/api/user/wishlist?${query}`);
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.product_ids)) {
            // If user just logged in and had guest items, sync them
            if (user?.id && wishlistIds.length > 0) {
              const combined = Array.from(new Set([...data.product_ids, ...wishlistIds]));
              setWishlistIds(combined);
              saveLocalWishlist(combined);

              // Tell server to sync
              await fetch('/api/user/wishlist/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  visitor_id: vid,
                  product_ids: combined
                })
              });
            } else {
              setWishlistIds(data.product_ids);
              saveLocalWishlist(data.product_ids);
            }
          }
        }
      } catch (err) {
        console.warn('Wishlist load notice:', err);
      }
    };

    fetchUserWishlist();
  }, [user]);

  // Fetch likes data for a specific product
  const fetchProductLikeData = useCallback(async (productId: string) => {
    if (!productId) return { likeCount: 0, isLiked: false };
    const vid = getOrCreateVisitorId();
    const query = user?.id 
      ? `user_id=${encodeURIComponent(user.id)}&visitor_id=${encodeURIComponent(vid)}`
      : `visitor_id=${encodeURIComponent(vid)}`;

    try {
      const resp = await fetch(`/api/products/${encodeURIComponent(productId)}/likes?${query}`);
      if (resp.ok) {
        const data = await resp.json();
        const count = typeof data.likeCount === 'number' ? data.likeCount : 0;
        const liked = Boolean(data.isLiked);

        setLikeCounts(prev => ({ ...prev, [productId]: count }));
        if (liked && !wishlistIds.includes(productId)) {
          setWishlistIds(prev => {
            const next = Array.from(new Set([...prev, productId]));
            saveLocalWishlist(next);
            return next;
          });
        }
        return { likeCount: count, isLiked: liked };
      }
    } catch {}

    const count = likeCounts[productId] || 0;
    const liked = wishlistIds.includes(productId);
    return { likeCount: count, isLiked: liked };
  }, [user, wishlistIds, likeCounts]);

  const isLiked = useCallback((productId: string): boolean => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const getLikeCount = useCallback((productId: string): number => {
    return likeCounts[productId] || 0;
  }, [likeCounts]);

  const toggleLike = useCallback(async (productId: string): Promise<boolean> => {
    if (!productId) return false;
    const vid = getOrCreateVisitorId();
    const currentlyLiked = wishlistIds.includes(productId);
    const nextState = !currentlyLiked;

    // Optimistic UI updates
    const nextWishlist = nextState 
      ? Array.from(new Set([...wishlistIds, productId]))
      : wishlistIds.filter(id => id !== productId);

    setWishlistIds(nextWishlist);
    saveLocalWishlist(nextWishlist);

    setLikeCounts(prev => {
      const currentCount = prev[productId] || 0;
      const nextCount = nextState ? currentCount + 1 : Math.max(0, currentCount - 1);
      return { ...prev, [productId]: nextCount };
    });

    try {
      const resp = await fetch(`/api/products/${encodeURIComponent(productId)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          visitor_id: vid,
          user_id: user?.id || null,
          action: nextState ? 'like' : 'unlike'
        })
      });

      if (resp.ok) {
        const result = await resp.json();
        if (typeof result.likeCount === 'number') {
          setLikeCounts(prev => ({ ...prev, [productId]: result.likeCount }));
        }
        return result.isLiked;
      }
    } catch (err) {
      console.warn('Like toggle sync error:', err);
    }

    return nextState;
  }, [wishlistIds, user]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isLiked,
        getLikeCount,
        toggleLike,
        fetchProductLikeData
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
