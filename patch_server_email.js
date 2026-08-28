import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const target = `  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { orderId, customerEmail } = req.body;
      const resendKey = process.env.RESEND_API_KEY;

      if (!resendKey) {
        return res.status(500).json({ error: "Resend API key missing" });
      }

      const resend = new Resend(resendKey);
      
      try {
        const { data: customerData, error: customerErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [customerEmail],
          subject: \`Order Confirmation - #\${String(orderId).slice(0, 8).toUpperCase()}\`,
          html: \`
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #d97706;">Order Confirmed!</h1>
              <p>Thank you for your purchase from Bhakt & Bhakti.</p>
              <p>Your order <strong>#\${String(orderId).slice(0, 8).toUpperCase()}</strong> has been successfully placed.</p>
              <p>We will process it shortly. Expected delivery is within 8 days.</p>
              <p>You can view your full order details and invoice by logging into your account on our website.</p>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">May the fragrance bring peace and devotion.</p>
            </div>
          \`
        });
        if (customerErr) {
          console.error("[Resend API Error - Customer]:", customerErr);
        }
      } catch (err) {
        console.error("Failed to send customer email:", err);
      }

      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'bbincensemanufacters@gmail.com';
        const { data: adminData, error: adminErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [adminEmail],
          subject: \`New Order Received - #\${String(orderId).slice(0, 8).toUpperCase()}\`,
          html: \`
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #d97706;">New Order Received!</h1>
              <p>A new order has been placed by <strong>\${customerEmail}</strong>.</p>
              <p>Order ID: <strong>#\${orderId}</strong></p>
              <p>Please log in to the admin dashboard to view the complete order details and fulfill it.</p>
            </div>
          \`
        });
        if (adminErr) {
          console.error("[Resend API Error - Admin]:", adminErr);
        }
      } catch (err) {
         console.error("Failed to send admin email:", err);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Email route error:", error);
      res.status(500).json({ error: error.message });
    }
  });`;

const replacement = `  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { orderId, customerEmail, customerName, shippingAddress, items, subtotal, shippingCharge, total } = req.body;
      const resendKey = process.env.RESEND_API_KEY;

      if (!resendKey) {
        return res.status(500).json({ error: "Resend API key missing" });
      }

      const resend = new Resend(resendKey);

      let invoiceHtml = '';
      if (items && items.length > 0) {
        const itemsHtml = items.map((item: any) => \`
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">\${item.product_name || item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">\${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹\${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹\${item.price * item.quantity}</td>
          </tr>
        \`).join('');

        invoiceHtml = \`
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px; background-color: #fcfaf8;">
            <h2 style="color: #d97706; margin-top: 0; margin-bottom: 5px;">Order Invoice</h2>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Order ID: <strong>#\${String(orderId).slice(0, 8).toUpperCase()}</strong></p>
            
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 14px; text-transform: uppercase; color: #9ca3af; margin-bottom: 5px;">Shipping To:</h3>
              <p style="margin: 0; font-weight: bold;">\${customerName || 'Customer'}</p>
              <p style="margin: 5px 0 0 0; white-space: pre-wrap; font-size: 14px;">\${shippingAddress || ''}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                \${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 10px; text-align: right;">₹\${subtotal || 0}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                  <td style="padding: 10px; text-align: right;">\${shippingCharge > 0 ? \`₹\${shippingCharge}\` : 'Free'}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #d97706;">Grand Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #d97706;">₹\${total || 0}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        \`;
      }
      
      try {
        const { data: customerData, error: customerErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [customerEmail],
          subject: \`Order Confirmation & Invoice - #\${String(orderId).slice(0, 8).toUpperCase()}\`,
          html: \`
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #d97706;">Order Confirmed!</h1>
              <p>Thank you for your purchase from Bhakt & Bhakti.</p>
              <p>Your order <strong>#\${String(orderId).slice(0, 8).toUpperCase()}</strong> has been successfully placed.</p>
              <p>We will process it shortly. Expected delivery is within 8 days.</p>
              
              \${invoiceHtml}
              
              <p style="margin-top: 30px; font-size: 12px; color: #666;">May the fragrance bring peace and devotion.</p>
            </div>
          \`
        });
        if (customerErr) {
          console.error("[Resend API Error - Customer]:", customerErr);
        }
      } catch (err) {
        console.error("Failed to send customer email:", err);
      }

      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'bbincensemanufacters@gmail.com';
        const { data: adminData, error: adminErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [adminEmail],
          subject: \`New Order Received - #\${String(orderId).slice(0, 8).toUpperCase()}\`,
          html: \`
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #d97706;">New Order Received!</h1>
              <p>A new order has been placed by <strong>\${customerEmail}</strong>.</p>
              <p>Order ID: <strong>#\${orderId}</strong></p>
              
              \${invoiceHtml}
              
              <p style="margin-top: 30px;">Please log in to the admin dashboard to view the complete order details and fulfill it.</p>
            </div>
          \`
        });
        if (adminErr) {
          console.error("[Resend API Error - Admin]:", adminErr);
        }
      } catch (err) {
         console.error("Failed to send admin email:", err);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Email route error:", error);
      res.status(500).json({ error: error.message });
    }
  });`;

if (code.includes('app.post("/api/send-order-email"')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with invoice HTML logic");
} else {
  console.log("Could not find target in server.ts");
}
