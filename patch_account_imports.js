import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Account.tsx', 'utf8');

if(code.includes("import { format } from 'date-fns';")) {
  code = code.replace("import { format } from 'date-fns';", "import { format, addDays } from 'date-fns';");
}

fs.writeFileSync('src/pages/customer/Account.tsx', code);
console.log("Patched imports in Account.tsx");
