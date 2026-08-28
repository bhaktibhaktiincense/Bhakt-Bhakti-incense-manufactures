import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'h-screen font-serif',
  'min-h-[70vh] font-serif'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx layout");
