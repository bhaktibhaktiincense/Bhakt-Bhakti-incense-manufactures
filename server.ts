import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jopjcvebzigntnpxljoa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback catalog of authentic items with authoritative pricing and inventory
const DEFAULT_CATALOG: Record<string, { name: string; price: number; stock: number; image: string }> = {
  'rajnigandha': { name: 'Rajnigandha Premium', price: 150, stock: 150, image: '/IMG-20260808-WA0005.jpg' },
  'rajnigandha-premium': { name: 'Rajnigandha Premium', price: 150, stock: 150, image: '/IMG-20260808-WA0005.jpg' },
  'mogra': { name: 'Mogra Essence', price: 150, stock: 120, image: '/IMG-20260808-WA0003.jpg' },
  'mogra-essence': { name: 'Mogra Essence', price: 150, stock: 120, image: '/IMG-20260808-WA0003.jpg' },
  'gulab': { name: 'Gulab (Rose) Premium', price: 150, stock: 110, image: '/IMG-20260808-WA0004.jpg' },
  'gulab-premium': { name: 'Gulab (Rose) Premium', price: 150, stock: 110, image: '/IMG-20260808-WA0004.jpg' },
  'sandalwood': { name: 'Sandalwood Classic', price: 150, stock: 90, image: '/1777729364289.png' },
  'sandalwood-classic': { name: 'Sandalwood Classic', price: 150, stock: 90, image: '/1777729364289.png' }
};

// In-memory set for preventing duplicate order submissions within 30 seconds
const recentOrderHashes = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 25MB body limit for image uploads and base64 handling
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Ensure public/uploads folder exists and serve it statically
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  /**
   * Image Upload API
   * Supports file uploads from mobile phone cameras, photo galleries, and desktops.
   * Attempts Supabase Storage upload first; falls back to server-side /uploads/ storage.
   */
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { filename, filetype, dataUrl } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: "No image data provided" });
      }

      // Validate mime type
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (filetype && !allowedMimes.includes(filetype.toLowerCase())) {
        return res.status(400).json({ error: "Only JPEG, PNG, and WebP images are supported." });
      }

      // Extract base64 buffer
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Validate size (max 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Image size exceeds 5MB limit." });
      }

      const ext = (filetype ? filetype.split("/")[1] : filename?.split(".").pop() || "jpg").replace("jpeg", "jpg");
      const safeFilename = `bb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      // 1. Try uploading to Supabase Storage if configured
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(safeFilename, buffer, {
            contentType: filetype || `image/${ext}`,
            upsert: true
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(safeFilename);
          if (publicUrlData?.publicUrl) {
            return res.json({ success: true, url: publicUrlData.publicUrl });
          }
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload skipped/errored, saving to local uploads:", storageErr);
      }

      // 2. Reliable server fallback in public/uploads/
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${safeFilename}`;
      return res.json({ success: true, url: publicUrl });
    } catch (err: any) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message || "Failed to process image upload" });
    }
  });

  // Ensure data directory exists for persistent local cache
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const localProductsFile = path.join(dataDir, "products.json");

  const getLocalProducts = (): any[] => {
    try {
      if (fs.existsSync(localProductsFile)) {
        return JSON.parse(fs.readFileSync(localProductsFile, "utf8"));
      }
    } catch (e) {
      console.warn("Failed reading local products file:", e);
    }
    return [];
  };

  const saveLocalProducts = (prods: any[]) => {
    try {
      fs.writeFileSync(localProductsFile, JSON.stringify(prods, null, 2));
    } catch (e) {
      console.warn("Failed saving local products file:", e);
    }
  };

  /**
   * GET /api/products
   * Serves active products directly from Supabase, augmented by any server updates
   */
  app.get("/api/products", async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      let { data: dbProducts, error } = await supabase.from("products").select("*");

      const localProds = getLocalProducts();
      const combinedMap = new Map<string, any>();

      // Base: Supabase products
      if (dbProducts && Array.isArray(dbProducts)) {
        for (const p of dbProducts) {
          combinedMap.set(p.id, p);
        }
      }

      // Merge local dynamic additions/edits
      for (const lp of localProds) {
        if (lp._deleted) {
          combinedMap.delete(lp.id);
        } else {
          combinedMap.set(lp.id, { ...combinedMap.get(lp.id), ...lp });
        }
      }

      let allProducts = Array.from(combinedMap.values());
      if (!includeInactive) {
        allProducts = allProducts.filter(p => p.active !== false);
      }

      return res.json(allProducts);
    } catch (err: any) {
      console.error("GET /api/products error:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch products" });
    }
  });

  /**
   * POST /api/admin/products
   * Creates or upserts a product in Supabase and server cache
   */
  app.post("/api/admin/products", async (req, res) => {
    try {
      const productPayload = req.body;
      if (!productPayload || !productPayload.name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      // 1. Try Supabase insert
      let dbCreated = null;
      try {
        const { data, error } = await supabase
          .from("products")
          .insert(productPayload)
          .select()
          .single();
        if (!error && data) {
          dbCreated = data;
        }
      } catch (dbErr) {
        console.warn("Supabase insert note:", dbErr);
      }

      // 2. Update server-side persistent store
      const localProds = getLocalProducts().filter(p => p.id !== productPayload.id);
      localProds.push(dbCreated || productPayload);
      saveLocalProducts(localProds);

      return res.json({ success: true, product: dbCreated || productPayload });
    } catch (err: any) {
      console.error("POST /api/admin/products error:", err);
      return res.status(500).json({ error: err.message || "Failed to save product" });
    }
  });

  /**
   * PUT /api/admin/products/:id
   * Updates an existing product in Supabase and server cache
   */
  app.put("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      let dbUpdated = null;
      try {
        const { data, error } = await supabase
          .from("products")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          dbUpdated = data;
        }
      } catch (dbErr) {
        console.warn("Supabase update note:", dbErr);
      }

      // Update server store
      const localProds = getLocalProducts();
      const existingIdx = localProds.findIndex(p => p.id === id);
      if (existingIdx >= 0) {
        localProds[existingIdx] = { ...localProds[existingIdx], ...updates, ...(dbUpdated || {}) };
      } else {
        localProds.push({ id, ...updates, ...(dbUpdated || {}) });
      }
      saveLocalProducts(localProds);

      return res.json({ success: true, product: dbUpdated || { id, ...updates } });
    } catch (err: any) {
      console.error("PUT /api/admin/products/:id error:", err);
      return res.status(500).json({ error: err.message || "Failed to update product" });
    }
  });

  /**
   * DELETE /api/admin/products/:id
   * Deletes a product from Supabase and server cache
   */
  app.delete("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;

      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (dbErr) {
        console.warn("Supabase delete note:", dbErr);
      }

      // Mark or remove from server store
      const localProds = getLocalProducts().filter(p => p.id !== id);
      localProds.push({ id, _deleted: true });
      saveLocalProducts(localProds);

      return res.json({ success: true, id });
    } catch (err: any) {
      console.error("DELETE /api/admin/products/:id error:", err);
      return res.status(500).json({ error: err.message || "Failed to delete product" });
    }
  });

  /**
   * Server-Validated Order Creation API
   * - Validates customer details and PIN code
   * - Validates product prices on the server (anti-tamper)
   * - Validates available stock quantities
   * - Prevents duplicate order submissions
   * - Creates immutable snapshot of ordered items
   * - Decrements inventory in database
   * - Triggers order confirmation email
   */
  app.post("/api/orders/create", async (req, res) => {
    try {
      const {
        customer_name,
        phone,
        email,
        shipping_address,
        city,
        state,
        pincode,
        order_notes,
        items,
        user_id
      } = req.body;

      // 1. Validate required customer fields
      if (!customer_name || customer_name.trim().length < 2) {
        return res.status(400).json({ error: "Please provide a valid customer name." });
      }

      const cleanPhone = String(phone || "").replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
      }

      const cleanPincode = String(pincode || "").replace(/\D/g, "");
      if (cleanPincode.length !== 6) {
        return res.status(400).json({ error: "Please enter a valid 6-digit PIN code." });
      }

      if (!shipping_address || shipping_address.trim().length < 5) {
        return res.status(400).json({ error: "Please enter a complete delivery address." });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Your shopping cart is empty." });
      }

      // 2. Duplicate submission lock
      const idempotencyKey = `${cleanPhone}-${JSON.stringify(items.map((i: any) => [i.product_id, i.quantity]))}`;
      if (recentOrderHashes.has(idempotencyKey)) {
        return res.status(429).json({ error: "An identical order was just placed. Please wait a moment before submitting again." });
      }
      recentOrderHashes.add(idempotencyKey);
      setTimeout(() => recentOrderHashes.delete(idempotencyKey), 30000);

      // 3. Fetch latest active products from Supabase & local store for authoritative server-side price & stock verification
      const { data: dbProducts } = await supabase.from("products").select("*");
      const productMap = new Map<string, any>();

      if (dbProducts && dbProducts.length > 0) {
        for (const p of dbProducts) {
          productMap.set(p.id, p);
          if (p.slug) productMap.set(p.slug, p);
        }
      }

      // Merge local updates
      const localProds = getLocalProducts();
      for (const lp of localProds) {
        if (lp._deleted) {
          productMap.delete(lp.id);
          if (lp.slug) productMap.delete(lp.slug);
        } else {
          const existing = productMap.get(lp.id) || {};
          const merged = { ...existing, ...lp };
          productMap.set(lp.id, merged);
          if (merged.slug) productMap.set(merged.slug, merged);
        }
      }

      // 4. Validate each item, check stock, and create immutable snapshot
      const validatedItems: Array<{
        product_id: string;
        product_name: string;
        price: number;
        quantity: number;
        image: string;
        total: number;
      }> = [];

      let serverSubtotal = 0;

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          return res.status(400).json({ error: `Invalid quantity for item ${item.name || item.product_id}` });
        }

        const dbProduct = productMap.get(item.product_id) || productMap.get(item.slug);
        const fallback = DEFAULT_CATALOG[item.product_id] || DEFAULT_CATALOG[item.slug || ''];

        const authorName = dbProduct?.name || dbProduct?.product_name || fallback?.name || item.name || 'Sacred Incense';

        // Check if product is active
        if (dbProduct && dbProduct.active === false) {
          return res.status(400).json({
            error: `"${authorName}" is currently inactive or hidden, and cannot be ordered.`
          });
        }

        const authorPrice = (typeof dbProduct?.price === 'number' && dbProduct.price > 0) 
          ? dbProduct.price 
          : (fallback?.price || item.price || 150);
        const availableStock = typeof dbProduct?.stock_quantity === 'number' 
          ? dbProduct.stock_quantity 
          : (fallback?.stock ?? 100);
        const authorImage = dbProduct?.image || fallback?.image || item.image || '/IMG-20260808-WA0005.jpg';

        // Check if sufficient stock is available
        if (qty > availableStock) {
          return res.status(400).json({
            error: `Insufficient stock for "${authorName}". Only ${availableStock} units available.`
          });
        }

        const itemTotal = authorPrice * qty;
        serverSubtotal += itemTotal;

        validatedItems.push({
          product_id: String(item.product_id),
          product_name: authorName,
          price: authorPrice,
          quantity: qty,
          image: authorImage,
          total: itemTotal
        });
      }

      // 5. Calculate authoritative shipping charge (Free delivery for ₹500+, ₹70 otherwise)
      const shippingCharge = serverSubtotal >= 500 ? 0 : 70;
      const serverTotal = serverSubtotal + shippingCharge;

      // 6. Generate unique order number (e.g. BB-ORD-KY72A-8942)
      const datePart = Date.now().toString(36).toUpperCase();
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const uniqueOrderNumber = `BB-ORD-${datePart}-${randPart}`;

      const fullAddress = `${shipping_address.trim()}, ${city || ''}, ${state || ''} - ${cleanPincode}${order_notes ? `\n\nNotes: ${order_notes}` : ''}`;

      // 7. Insert Order into Supabase
      let orderRecord: any = null;
      try {
        const { data: insertedOrder, error: orderErr } = await supabase
          .from("orders")
          .insert({
            order_number: uniqueOrderNumber,
            user_id: user_id || null,
            customer_name: customer_name.trim(),
            email: email?.trim() || `${cleanPhone}@customer.bbincense.in`,
            phone: cleanPhone,
            shipping_address: fullAddress,
            order_notes: order_notes || null,
            subtotal: serverSubtotal,
            total: serverTotal,
            status: "Pending",
            payment_status: "Pending (COD)",
            payment_method: "COD"
          })
          .select()
          .single();

        if (orderErr) {
          console.warn("Direct order select error (RLS), trying blind insert:", orderErr.message);
          // If select is denied by RLS, insert without returning data
          const blindInsert = await supabase.from("orders").insert({
            order_number: uniqueOrderNumber,
            user_id: user_id || null,
            customer_name: customer_name.trim(),
            email: email?.trim() || `${cleanPhone}@customer.bbincense.in`,
            phone: cleanPhone,
            shipping_address: fullAddress,
            order_notes: order_notes || null,
            subtotal: serverSubtotal,
            total: serverTotal,
            status: "Pending",
            payment_status: "Pending (COD)",
            payment_method: "COD"
          });
          if (blindInsert.error) {
            console.error("Order insertion failed:", blindInsert.error);
          }
          orderRecord = { id: uniqueOrderNumber, order_number: uniqueOrderNumber };
        } else {
          orderRecord = insertedOrder;
        }
      } catch (dbErr) {
        console.error("Database order insertion error:", dbErr);
        orderRecord = { id: uniqueOrderNumber, order_number: uniqueOrderNumber };
      }

      const finalOrderId = orderRecord?.id || uniqueOrderNumber;

      // 8. Insert Immutable Order Items
      try {
        const orderItemsRows = validatedItems.map((vi) => ({
          order_id: finalOrderId,
          product_id: vi.product_id,
          product_name: vi.product_name,
          price: vi.price,
          quantity: vi.quantity,
          image: vi.image
        }));

        const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsRows);
        if (itemsErr) {
          console.warn("Order items insertion warning:", itemsErr.message);
        }
      } catch (itemErr) {
        console.error("Order items error:", itemErr);
      }

      // 9. Decrement stock in database for ordered items
      for (const vi of validatedItems) {
        try {
          const currentP = productMap.get(vi.product_id);
          if (currentP && typeof currentP.stock_quantity === 'number') {
            const newStock = Math.max(0, currentP.stock_quantity - vi.quantity);
            await supabase
              .from("products")
              .update({ 
                stock_quantity: newStock,
                availability_label: newStock === 0 ? 'Out of Stock' : currentP.availability_label
              })
              .eq("id", currentP.id);
          }
        } catch (stockErr) {
          console.error("Error updating stock quantity:", stockErr);
        }
      }

      // 10. Send Confirmation Email via Resend asynchronously (does not block checkout response)
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey && resendKey !== "your_resend_api_key_here") {
          const resend = new Resend(resendKey);
          const customerEmail = email?.trim() || 'bbincensemanufacters@gmail.com';

          const itemsHtml = validatedItems.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total}</td>
            </tr>
          `).join("");

          const invoiceHtml = `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px; background-color: #fcfaf8;">
              <h2 style="color: #d97706; margin-top: 0; margin-bottom: 5px;">Order Invoice (Cash on Delivery)</h2>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Order No: <strong>${uniqueOrderNumber}</strong></p>
              
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; text-transform: uppercase; color: #9ca3af; margin-bottom: 5px;">Customer & Delivery Details:</h3>
                <p style="margin: 0; font-weight: bold;">${customer_name}</p>
                <p style="margin: 3px 0; font-size: 14px;">Mobile: ${cleanPhone}</p>
                <p style="margin: 5px 0 0 0; white-space: pre-wrap; font-size: 14px;">${fullAddress}</p>
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
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                    <td style="padding: 10px; text-align: right;">₹${serverSubtotal}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                    <td style="padding: 10px; text-align: right;">${shippingCharge > 0 ? `₹${shippingCharge}` : 'FREE'}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #d97706;">Total Amount (COD):</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #d97706;">₹${serverTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          `;

          // Send to Customer if valid email provided
          if (email && email.includes("@")) {
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
              to: [customerEmail],
              subject: `Order Confirmation #${uniqueOrderNumber} - Bhakt & Bhakti Incense`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h1 style="color: #d97706;">Order Confirmed!</h1>
                  <p>Namaste <strong>${customer_name}</strong>,</p>
                  <p>Thank you for choosing Bhakt & Bhakti Incense. Your order has been placed successfully via Cash on Delivery.</p>
                  <p>Order Number: <strong>${uniqueOrderNumber}</strong></p>
                  ${invoiceHtml}
                  <p style="margin-top: 30px; font-size: 13px; color: #666;">May our divine fragrances fill your sacred space with peace and positive aura.</p>
                </div>
              `
            }).catch(e => console.error("Customer email error:", e));
          }

          // Send notification to Admin
          const adminEmail = process.env.ADMIN_EMAIL || 'bbincensemanufacters@gmail.com';
          const toAddrs = [adminEmail];
          if (adminEmail !== 'bs635379@gmail.com') toAddrs.push('bs635379@gmail.com');

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
            to: toAddrs,
            subject: `New COD Order Received #${uniqueOrderNumber} - ₹${serverTotal}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #d97706;">New Order Received!</h1>
                <p>A new Cash on Delivery order was placed by <strong>${customer_name}</strong> (${cleanPhone}).</p>
                ${invoiceHtml}
                <p style="margin-top: 20px;">Please open the Admin Panel -> Orders to confirm and dispatch the shipment.</p>
              </div>
            `
          }).catch(e => console.error("Admin email error:", e));
        }
      } catch (emailErr) {
        console.error("Order email error:", emailErr);
      }

      return res.json({
        success: true,
        orderId: finalOrderId,
        orderNumber: uniqueOrderNumber,
        subtotal: serverSubtotal,
        shippingCharge,
        total: serverTotal,
        items: validatedItems
      });

    } catch (err: any) {
      console.error("Order creation fatal error:", err);
      return res.status(500).json({ error: err.message || "Failed to process order. Please try again." });
    }
  });

  // Explicitly serve sitemap.xml to prevent SPA fallback interception
  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    const filePath = process.env.NODE_ENV !== "production" 
      ? path.join(process.cwd(), "public", "sitemap.xml")
      : path.join(process.cwd(), "dist", "sitemap.xml");
    res.sendFile(filePath);
  });

  // Explicitly serve robots.txt to prevent SPA fallback interception
  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    const filePath = process.env.NODE_ENV !== "production" 
      ? path.join(process.cwd(), "public", "robots.txt")
      : path.join(process.cwd(), "dist", "robots.txt");
    res.sendFile(filePath);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
