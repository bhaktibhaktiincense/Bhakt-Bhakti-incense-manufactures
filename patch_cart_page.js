import fs from 'fs';

let code = fs.readFileSync('src/pages/shop/Cart.tsx', 'utf8');

const target1 = `  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();`;
const replacement1 = `  const { items, updateQuantity, removeFromCart, cartTotal, shippingCharge, cartTotalWithShipping } = useCart();`;

const target2 = `                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t border-chai-200 pt-4 mb-6 flex justify-between items-center text-espresso-900">
                  <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-serif text-2xl font-bold">₹{cartTotal}</span>
                </div>`;
const replacement2 = `                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-serif">{shippingCharge > 0 ? \`₹\${shippingCharge}\` : 'Free'}</span>
                  </div>
                  {shippingCharge > 0 && (
                    <div className="text-xs text-marigold-600 italic">Free shipping on orders over ₹500</div>
                  )}
                </div>
                <div className="border-t border-chai-200 pt-4 mb-6 flex justify-between items-center text-espresso-900">
                  <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-serif text-2xl font-bold">₹{cartTotalWithShipping}</span>
                </div>`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/pages/shop/Cart.tsx', code);
console.log("Patched Cart.tsx");
