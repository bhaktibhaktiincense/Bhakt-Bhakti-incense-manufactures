import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  'className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8 max-w-5xl leading-[1.1] text-chai-50"',
  'className="font-serif text-4xl md:text-7xl lg:text-8xl mb-6 max-w-5xl leading-tight text-chai-50"'
);

// Also check text-4xl lg:text-5xl
code = code.replace(
  'className="font-serif text-4xl lg:text-5xl mb-6 text-espresso-900 leading-tight"',
  'className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-espresso-900 leading-tight"'
);
code = code.replace(
  'className="font-serif text-4xl lg:text-5xl mb-4 text-marigold-400"',
  'className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-marigold-400"'
);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched Home.tsx headings");
