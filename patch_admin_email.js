import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const target = `const adminEmail = process.env.ADMIN_EMAIL || 'bbincensemanufacters@gmail.com';
        const { data: adminData, error: adminErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: [adminEmail],`;

const replacement = `const adminEmail = process.env.ADMIN_EMAIL || 'bbincensemanufacters@gmail.com';
        // Add the user's AI Studio email as a fallback testing address if the domain isn't verified yet
        const toAddresses = [adminEmail];
        if (adminEmail !== 'bs635379@gmail.com') {
           toAddresses.push('bs635379@gmail.com');
        }
        
        const { data: adminData, error: adminErr } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',
          to: toAddresses,`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts admin email array");
