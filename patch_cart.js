import fs from 'fs';

let code = fs.readFileSync('src/contexts/CartContext.tsx', 'utf8');

const target1 = `  cartTotal: number;
  loading: boolean;
};`;

const replacement1 = `  cartTotal: number;
  shippingCharge: number;
  cartTotalWithShipping: number;
  loading: boolean;
};`;

const target2 = `  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, loading }}>`;

const replacement2 = `  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCharge = cartTotal > 0 && cartTotal < 500 ? 70 : 0;
  const cartTotalWithShipping = cartTotal + shippingCharge;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, shippingCharge, cartTotalWithShipping, loading }}>`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/contexts/CartContext.tsx', code);
console.log("Patched CartContext successfully");
