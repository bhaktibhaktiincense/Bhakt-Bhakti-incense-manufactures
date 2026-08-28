import fs from 'fs';
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

// Ensure links collapse nicely
code = code.replace(
  'className="flex space-x-6 mt-4 md:mt-0"',
  'className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0"'
);

fs.writeFileSync('src/components/Footer.tsx', code);
console.log("Patched Footer.tsx mobile layout");
