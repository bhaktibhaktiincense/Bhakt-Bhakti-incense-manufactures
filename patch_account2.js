import fs from 'fs';

let code = fs.readFileSync('src/pages/customer/Account.tsx', 'utf8');

const target1 = `<p className="text-lg text-espresso-900 font-medium">{profile?.name || 'Not provided'}</p>`;
const replacement1 = `<p className="text-lg text-espresso-900 font-medium">{profile?.name || user?.user_metadata?.full_name || 'Not provided'}</p>`;

code = code.replace(target1, replacement1);

fs.writeFileSync('src/pages/customer/Account.tsx', code);
console.log("Patched Account.tsx profile fallback");
