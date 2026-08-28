import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const target = `from: 'Bhakt & Bhakti <orders@bhaktandbhakti.com>',`;
const replacement = `from: process.env.RESEND_FROM_EMAIL || 'Bhakt & Bhakti <onboarding@resend.dev>',`;

code = code.replace(new RegExp(target, 'g'), replacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Resend from email");
