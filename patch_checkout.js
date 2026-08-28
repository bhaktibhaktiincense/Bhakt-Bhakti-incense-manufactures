import fs from 'fs';

let code = fs.readFileSync('src/pages/shop/Checkout.tsx', 'utf8');

const target1 = `  const { items, cartTotal, clearCart } = useCart();`;
const replacement1 = `  const { items, cartTotal, shippingCharge, cartTotalWithShipping, clearCart } = useCart();`;

const target2 = `        .insert({
          user_id: user.id,
          customer_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shipping_address: fullAddress,
          subtotal: cartTotal,
          total: cartTotal, // Add shipping here if applicable
          status: 'Pending',
          payment_status: 'Pending (COD)'
        })`;
const replacement2 = `        .insert({
          user_id: user.id,
          customer_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shipping_address: fullAddress,
          subtotal: cartTotal,
          total: cartTotalWithShipping,
          status: 'Pending',
          payment_status: 'Pending (COD)'
        })`;

const target3 = `      // Clear Cart
      await clearCart();
      
      navigate(\`/order-confirmation/\${order.id}\`);`;
const replacement3 = `      // Update Customer Profile implicitly
      await supabase.from('customer_profiles').upsert({
        id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress
      });

      // Clear Cart
      await clearCart();
      
      // Try sending confirmation email via full-stack route (graceful fallback if it fails)
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, customerEmail: formData.email })
        });
      } catch (emailErr) {
        console.error('Email sending failed, but order was placed:', emailErr);
      }
      
      navigate(\`/order-confirmation/\${order.id}\`);`;

const target4 = `                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                  </div>
                </div>
                <div className="border-t border-chai-200 pt-4 flex justify-between items-center text-espresso-900">
                  <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-serif text-2xl font-bold">₹{cartTotal}</span>
                </div>`;
const replacement4 = `                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-serif">{shippingCharge > 0 ? \`₹\${shippingCharge}\` : 'Free'}</span>
                  </div>
                </div>
                <div className="border-t border-chai-200 pt-4 flex justify-between items-center text-espresso-900">
                  <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-serif text-2xl font-bold">₹{cartTotalWithShipping}</span>
                </div>`;


code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);
code = code.replace(target4, replacement4);

fs.writeFileSync('src/pages/shop/Checkout.tsx', code);
console.log("Patched Checkout.tsx");
