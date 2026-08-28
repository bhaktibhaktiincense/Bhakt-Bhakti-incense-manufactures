const fs = require('fs');
let code = fs.readFileSync('src/pages/shop/Checkout.tsx', 'utf8');

const replaceStr = `      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }`;

code = code.replace(/const { error: itemsError } = await supabase\s*\.from\('order_items'\)\s*\.insert\(orderItems\);\s*if \(itemsError\) throw itemsError;/g, replaceStr);

fs.writeFileSync('src/pages/shop/Checkout.tsx', code);
