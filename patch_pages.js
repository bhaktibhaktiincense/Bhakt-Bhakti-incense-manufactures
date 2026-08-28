import fs from 'fs';

function patchFile(filePath, title, description, path) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Add import if not present
  if (!code.includes('useSEO')) {
    code = code.replace(/import React[^;]*;/, "$&\nimport { useSEO } from '../hooks/useSEO';");
  }

  // Find component body
  // Usually starts with `export default function ComponentName() {`
  const compRegex = /export default function [a-zA-Z]+\(\)[^\{]*\{/;
  
  if (compRegex.test(code)) {
    const hookCall = `\n  useSEO({
    title: "${title}",
    description: "${description}",
    path: "${path}"
  });\n`;
    
    code = code.replace(compRegex, "$&" + hookCall);
    fs.writeFileSync(filePath, code);
    console.log(`Patched ${filePath}`);
  }
}

// Ensure the first import regex matches. For some files it might just be `import { ... } from 'react'`
// Better generic import injection:
function patchFileRobust(filePath, title, description, path) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  if (!code.includes('useSEO')) {
    // Add import right after the first line (or after first import)
    code = `import { useSEO } from '../hooks/useSEO';\n` + code;
  }

  const compRegex = /export (default )?function [a-zA-Z0-9_]+\([^\)]*\)\s*\{/;
  const match = code.match(compRegex);
  
  if (match) {
    // Check if it already has useSEO call
    if (!code.includes(`useSEO({`)) {
      const hookCall = `\n  useSEO({ title: "${title}", description: "${description}", path: "${path}" });\n`;
      code = code.replace(match[0], match[0] + hookCall);
      fs.writeFileSync(filePath, code);
      console.log(`Patched ${filePath}`);
    }
  } else {
    // maybe const Component = () => {
    const arrowRegex = /const [a-zA-Z0-9_]+\s*=\s*\([^\)]*\)\s*=>\s*\{/;
    const arrowMatch = code.match(arrowRegex);
    if (arrowMatch && !code.includes(`useSEO({`)) {
      const hookCall = `\n  useSEO({ title: "${title}", description: "${description}", path: "${path}" });\n`;
      code = code.replace(arrowMatch[0], arrowMatch[0] + hookCall);
      fs.writeFileSync(filePath, code);
      console.log(`Patched ${filePath}`);
    }
  }
}

patchFileRobust('src/pages/Home.tsx', 'Premium Agarbatti Manufacturer', 'Bhakt & Bhakti Incense is a premium incense-stick manufacturing company offering quality fragrances for every sacred moment.', '/');
patchFileRobust('src/pages/About.tsx', 'About Us', 'Learn about Bhakt & Bhakti Incense, our history, our values, and our commitment to crafting premium natural agarbatti.', '/about');
patchFileRobust('src/pages/Products.tsx', 'Our Incense Products', 'Explore our premium collection of handcrafted incense sticks. Shop natural, soothing fragrances for devotion and meditation.', '/products');
patchFileRobust('src/pages/Manufacturing.tsx', 'Manufacturing Process', 'Discover how our premium incense sticks are crafted with natural ingredients, traditional techniques, and strict quality control.', '/manufacturing');
patchFileRobust('src/pages/Quality.tsx', 'Quality Standards', 'Our commitment to purity and quality. Read about our rigorous testing and pure ingredient sourcing for the best agarbatti.', '/quality');
patchFileRobust('src/pages/Contact.tsx', 'Contact Us', 'Get in touch with Bhakt & Bhakti Incense for wholesale inquiries, support, or general questions about our products.', '/contact');
patchFileRobust('src/pages/Feedback.tsx', 'Share Your Feedback', 'We value your experience with our incense products. Share your feedback with Bhakt & Bhakti Incense.', '/feedback');
patchFileRobust('src/pages/Complaint.tsx', 'File a Complaint', 'Have an issue with your order or product? File a complaint and our support team will assist you promptly.', '/complaint');

