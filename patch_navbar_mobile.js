import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  'className="absolute top-0 left-0 w-full h-screen bg-chai-50 z-40 flex flex-col pt-28 px-8"',
  'className="absolute top-0 left-0 w-full h-[100svh] bg-chai-50 z-40 flex flex-col pt-28 px-8 overflow-y-auto pb-10"'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Patched Navbar.tsx mobile layout");
