import fs from 'fs';
let code = fs.readFileSync('src/pages/About.tsx', 'utf8');

code = code.replace(
  'src="/IMG20260819113612_BURST001.jpg"',
  'src="/DSC_0476.jpg"'
);
code = code.replace(
  'alt="Agarbatti Manufacturing Machine in Production Facility"',
  'alt="Bhakt & Bhakti Production Facility"'
);

fs.writeFileSync('src/pages/About.tsx', code);
console.log("Patched About.tsx");
