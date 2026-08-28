import fs from 'fs';

let code = fs.readFileSync('src/pages/shop/Checkout.tsx', 'utf8');

const target = `body: JSON.stringify({ orderId: order.id, customerEmail: formData.email })`;

const replacement = `body: JSON.stringify({ 
            orderId: order.id, 
            customerEmail: formData.email,
            customerName: formData.name,
            shippingAddress: fullAddress,
            items: orderItems,
            subtotal: cartTotal,
            shippingCharge: shippingCharge,
            total: cartTotalWithShipping
          })`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/shop/Checkout.tsx', code);
console.log("Patched Checkout.tsx email payload");
