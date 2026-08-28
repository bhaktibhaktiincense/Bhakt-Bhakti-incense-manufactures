import fs from 'fs';
let code = fs.readFileSync('src/pages/Quality.tsx', 'utf8');

code = code.replace(
  'className="flex items-start space-x-6 bg-chai-100 p-8 rounded-tr-3xl rounded-bl-3xl shadow-sm border border-marigold-500/20 hover:border-marigold-500 transition-colors"',
  'className="flex items-start space-x-4 md:space-x-6 bg-chai-100 p-6 md:p-8 rounded-tr-3xl rounded-bl-3xl shadow-sm border border-marigold-500/20 hover:border-marigold-500 transition-colors"'
);
code = code.replace(
  'className="w-48 h-48 bg-chai-100 flex items-center justify-center text-sm text-espresso-700 border-2 border-dashed border-marigold-500/50 rounded-full"',
  'className="w-40 h-40 md:w-48 md:h-48 bg-chai-100 flex items-center justify-center text-sm text-espresso-700 border-2 border-dashed border-marigold-500/50 rounded-full"'
);
code = code.replace(
  'className="w-48 h-48 bg-chai-100 flex items-center justify-center text-sm text-espresso-700 border-2 border-dashed border-marigold-500/50 rounded-full"',
  'className="w-40 h-40 md:w-48 md:h-48 bg-chai-100 flex items-center justify-center text-sm text-espresso-700 border-2 border-dashed border-marigold-500/50 rounded-full"'
);

fs.writeFileSync('src/pages/Quality.tsx', code);
console.log("Patched Quality.tsx mobile layout");
