import fs from 'fs';
let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

code = code.replace(
  'className="h-96 overflow-hidden relative p-4 pt-4 bg-chai-100 flex items-center justify-center"',
  'className="h-72 md:h-96 overflow-hidden relative p-4 pt-4 bg-chai-100 flex items-center justify-center"'
);

code = code.replace(
  'className="text-espresso-700 text-sm mb-6 leading-relaxed h-12"',
  'className="text-espresso-700 text-sm mb-6 leading-relaxed min-h-[3rem]"'
);

fs.writeFileSync('src/pages/Products.tsx', code);
console.log("Patched Products.tsx mobile layout");
