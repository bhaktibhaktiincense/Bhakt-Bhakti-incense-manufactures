import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export type CartItem = {
  id?: string;
  product_id: string; // we'll use product name as ID for now since we don't have a products table
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  shippingCharge: number;
  cartTotalWithShipping: number;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from local storage initially
  useEffect(() => {
    const savedCart = localStorage.getItem('bb_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setLoading(false);
  }, []);

  // Sync to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('bb_cart', JSON.stringify(items));
  }, [items]);

  // If user logs in, we could theoretically sync with Supabase here
  // For simplicity and speed in this iteration, local storage handles refresh persistence perfectly,
  // but to strictly follow the prompt "Create/use appropriate tables such as: carts, cart_items",
  // we will implement DB sync.
  useEffect(() => {
    const syncCartWithDb = async () => {
      if (!user) return;
      try {
        // Get user's active cart
        let { data: cart, error: getCartError } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (getCartError && getCartError.code !== 'PGRST116') {
          throw getCartError;
        }

        if (!cart) {
          // Create a cart
          const { data: newCart, error } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select()
            .single();
          if (error) throw error;
          cart = newCart;
        }

        if (cart) {
          // Merge local items with DB items (or just fetch DB items)
          const { data: dbItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id);

          if (dbItems && dbItems.length > 0 && items.length === 0) {
             setItems(dbItems.map(item => ({
               id: item.id,
               product_id: item.product_id,
               name: item.name,
               price: item.price,
               quantity: item.quantity,
               image: item.image
             })));
          }
        }
      } catch (error: any) {
        if (error.code === 'PGRST205') {
          // Table missing (SQL not run yet). Suppress the console error.
          return;
        }
        console.error("Error syncing cart:", error);
      }
    };

    if (user && !loading) {
      syncCartWithDb();
    }
  }, [user]);


  const getOrCreateDbCart = async () => {
    if (!user) return null;
    try {
      let { data: cart, error: getError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (getError && getError.code !== 'PGRST116') {
         if (getError.code === 'PGRST205') return null;
         throw getError;
      }
      
      if (!cart) {
        const { data: newCart, error: insertError } = await supabase.from('carts').insert({ user_id: user.id }).select().single();
        if (insertError) {
          if (insertError.code === 'PGRST205') return null;
          throw insertError;
        }
        cart = newCart;
      }
      return cart?.id;
    } catch (e: any) {
      if (e.code === 'PGRST205') return null;
      console.error("getOrCreateDbCart error:", e);
      return null;
    }
  };

  const addToCart = async (newItem: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === newItem.product_id);
      if (existing) {
        return prev.map(i => i.product_id === newItem.product_id ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      }
      return [...prev, newItem as CartItem];
    });

    if (user) {
      try {
        const cartId = await getOrCreateDbCart();
        if (cartId) {
          // Check if item exists in DB
          const { data: existing } = await supabase.from('cart_items').select('*').eq('cart_id', cartId).eq('product_id', newItem.product_id).single();
          if (existing) {
            await supabase.from('cart_items').update({ quantity: existing.quantity + newItem.quantity }).eq('id', existing.id);
          } else {
            await supabase.from('cart_items').insert({
              cart_id: cartId,
              product_id: newItem.product_id,
              name: newItem.name,
              price: newItem.price,
              quantity: newItem.quantity,
              image: newItem.image
            });
          }
        }
      } catch (e: any) {
        if (e.code !== 'PGRST205') console.error("DB cart update error", e);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setItems(prev => prev.filter(i => i.product_id !== productId));
    
    if (user) {
      try {
        const cartId = await getOrCreateDbCart();
        if (cartId) {
          await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('product_id', productId);
        }
      } catch (e: any) {
        if (e.code !== 'PGRST205') console.error(e);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity } : i));

    if (user) {
      try {
        const cartId = await getOrCreateDbCart();
        if (cartId) {
          await supabase.from('cart_items').update({ quantity }).eq('cart_id', cartId).eq('product_id', productId);
        }
      } catch (e: any) {
        if (e.code !== 'PGRST205') console.error(e);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        const cartId = await getOrCreateDbCart();
        if (cartId) {
          await supabase.from('cart_items').delete().eq('cart_id', cartId);
        }
      } catch (e: any) {
        if (e.code !== 'PGRST205') console.error(e);
      }
    }
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCharge = cartTotal > 0 && cartTotal < 500 ? 70 : 0;
  const cartTotalWithShipping = cartTotal + shippingCharge;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, shippingCharge, cartTotalWithShipping, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
