import fs from 'fs';

let code = fs.readFileSync('src/pages/customer/Account.tsx', 'utf8');

const target1 = `import { format } from 'date-fns';`;
if(!code.includes(target1)) {
  code = code.replace(`import { useNavigate } from 'react-router-dom';`, `import { useNavigate } from 'react-router-dom';\nimport { format, addDays } from 'date-fns';`);
}

const target2 = `<div className="mt-4 pt-4 border-t border-chai-200">
                          <div className="flex justify-end gap-3">`;

const replacement2 = `<div className="mt-4 pt-4 border-t border-chai-200 flex justify-between items-center">
                          <div className="text-sm font-medium text-espresso-700">
                            <span className="font-bold uppercase tracking-wider text-xs text-espresso-500 mr-2">Expected Delivery:</span>
                            {format(addDays(new Date(order.created_at), 8), 'MMM d, yyyy')}
                          </div>
                          <div className="flex justify-end gap-3">`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/pages/customer/Account.tsx', code);
console.log("Patched Account.tsx");
