import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  'src="/agarbatti_facility.jpg"',
  'src="/file_00000000aa9481fa82329b99e103da5e.png"'
);
code = code.replace(
  'alt="Bhakt & Bhakti Premium Agarbatti Manufacturing Facility"',
  'alt="Bhakt & Bhakti Premium Incense Sticks"'
);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched Home.tsx");
