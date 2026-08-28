import fs from 'fs';
let code = fs.readFileSync('src/pages/Manufacturing.tsx', 'utf8');

code = code.replace(
  'className="w-full h-96 bg-espresso-800 flex items-center justify-center text-chai-200 border-4 border-marigold-500/30 rounded-t-[100px] shadow-2xl relative overflow-hidden"',
  'className="w-full h-64 md:h-96 bg-espresso-800 flex items-center justify-center text-chai-200 border-4 border-marigold-500/30 rounded-t-[100px] shadow-2xl relative overflow-hidden"'
);

fs.writeFileSync('src/pages/Manufacturing.tsx', code);
console.log("Patched Manufacturing.tsx mobile layout");
