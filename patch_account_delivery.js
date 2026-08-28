import fs from 'fs';

let code = fs.readFileSync('src/pages/customer/Account.tsx', 'utf8');

const target = `<div className="p-6">
                          <div className="flex justify-end gap-3">`;

const replacement = `<div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-sm font-medium text-espresso-700 w-full sm:w-auto">
                            <span className="font-bold uppercase tracking-wider text-xs text-espresso-500 mr-2">Expected Delivery:</span>
                            {format(addDays(new Date(order.created_at), 8), 'MMM d, yyyy')}
                          </div>
                          <div className="flex justify-end gap-3 w-full sm:w-auto">`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/customer/Account.tsx', code);
  console.log("Patched delivery date in Account.tsx");
} else {
  console.log("Could not find target block in Account.tsx");
}
