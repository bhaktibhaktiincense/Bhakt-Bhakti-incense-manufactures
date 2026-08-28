import fs from 'fs';
let code = fs.readFileSync('src/pages/About.tsx', 'utf8');

code = code.replace(
  'className="text-espresso-800 leading-relaxed text-lg pl-16 border-l-2 border-chai-200"',
  'className="text-espresso-800 leading-relaxed text-lg pl-6 md:pl-16 border-l-2 border-chai-200"'
);

code = code.replace(
  'className="grid md:grid-cols-2 gap-6 pl-16"',
  'className="grid md:grid-cols-2 gap-6 pl-6 md:pl-16"'
);

fs.writeFileSync('src/pages/About.tsx', code);
console.log("Patched About.tsx mobile layout");
