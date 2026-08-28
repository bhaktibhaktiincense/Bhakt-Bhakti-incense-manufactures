import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Hero Section Height & Text
code = code.replace(
  'className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-espresso-900"',
  'className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden bg-espresso-900 py-24"'
);
code = code.replace(
  'className="font-serif text-6xl lg:text-[7rem] text-chai-50 leading-[0.9] mb-8 relative"',
  'className="font-serif text-5xl md:text-6xl lg:text-[7rem] text-chai-50 leading-tight md:leading-[0.9] mb-8 relative"'
);

// 2. Intro Section
code = code.replace(
  'className="relative h-[600px] flex justify-center items-center"',
  'className="relative h-[400px] md:h-[600px] flex justify-center items-center mt-12 md:mt-0"'
);
code = code.replace(
  'className="absolute -bottom-6 -left-2 w-48 h-48 bg-kumkum-600 rounded-full p-8 flex items-center justify-center text-chai-50 flex-col shadow-2xl z-20 border-4 border-chai-50"',
  'className="absolute -bottom-6 -left-2 w-36 h-36 md:w-48 md:h-48 bg-kumkum-600 rounded-full p-4 md:p-8 flex items-center justify-center text-chai-50 flex-col shadow-2xl z-20 border-4 border-chai-50"'
);
code = code.replace(
  'className="font-serif text-4xl mb-1 text-marigold-400"',
  'className="font-serif text-3xl md:text-4xl mb-1 text-marigold-400"'
);

// 3. Featured Products
code = code.replace(
  'className="h-72 overflow-hidden relative p-6 pt-8 bg-chai-100 flex items-center justify-center rounded-t-[90px]"',
  'className="h-56 md:h-72 overflow-hidden relative p-6 pt-8 bg-chai-100 flex items-center justify-center rounded-t-[90px]"'
);
// it occurs twice because of the map and main product
code = code.replace(
  'className="h-72 overflow-hidden relative p-6 pt-8 bg-chai-100 flex items-center justify-center rounded-t-[90px]"',
  'className="h-56 md:h-72 overflow-hidden relative p-6 pt-8 bg-chai-100 flex items-center justify-center rounded-t-[90px]"'
);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched Home.tsx mobile layout");
