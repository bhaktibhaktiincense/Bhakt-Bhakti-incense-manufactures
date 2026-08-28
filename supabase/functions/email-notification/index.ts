import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in Edge Function secrets");
    }

    const payload = await req.json()
    console.log("Webhook Payload:", payload)

    const table = payload.table;
    const record = payload.record;

    if (!record) {
       throw new Error("No record found in payload. Is this a Supabase Webhook?");
    }

    let subject = "New Notification from Bhakt & Bhakti";
    let html = "<p>You have a new notification.</p>";

    // Case-insensitive table name matching
    const tableName = (table || '').toLowerCase();

    if (tableName === 'feedback') {
      subject = `New Feedback from ${record.name || 'Customer'}`;
      html = `
        <h2>New Feedback</h2>
        <p><strong>Name:</strong> ${record.name}</p>
        <p><strong>Contact:</strong> ${record.phone || record.email || 'N/A'}</p>
        <p><strong>Rating:</strong> ${record.rating}</p>
        <p><strong>Message:</strong> ${record.message}</p>
      `;
    } else if (tableName === 'product_enquiries') {
      subject = `New Product Enquiry: ${record.product_name || 'B2B'}`;
      html = `
        <h2>New Product Enquiry</h2>
        <p><strong>Name:</strong> ${record.name}</p>
        <p><strong>Contact:</strong> ${record.phone} / ${record.email || 'N/A'}</p>
        <p><strong>Product:</strong> ${record.product_name}</p>
        <p><strong>Message:</strong> ${record.message}</p>
      `;
    } else if (tableName === 'complaints') {
      subject = `New Complaint: ${record.subject}`;
      html = `
        <h2>New Complaint</h2>
        <p><strong>Name:</strong> ${record.name}</p>
        <p><strong>Contact:</strong> ${record.phone} / ${record.email || 'N/A'}</p>
        <p><strong>Subject:</strong> ${record.subject}</p>
        <p><strong>Message:</strong> ${record.message}</p>
      `;
    } else {
       console.log(`Unrecognized table: ${tableName}. Sending default email.`);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Bhakt & Bhakti <onboarding@resend.dev>',
        to: ['bs635379@gmail.com'],
        subject: subject,
        html: html
      })
    });

    const data = await res.json();
    console.log("Resend Response:", data);

    if (!res.ok) {
      throw new Error(`Resend API Error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      // Returning 502 as requested by the original issue description
      status: 502,
    })
  }
})
