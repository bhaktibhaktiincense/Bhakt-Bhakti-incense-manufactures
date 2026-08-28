import fs from 'fs';

let code = fs.readFileSync('src/pages/shop/OrderConfirmation.tsx', 'utf8');

const target1 = `import { format } from 'date-fns';`;
if(!code.includes(target1)) {
  code = code.replace(`import { useParams, useNavigate, Link } from 'react-router-dom';`, `import { useParams, useNavigate, Link } from 'react-router-dom';\nimport { format, addDays } from 'date-fns';`);
}

const target2 = `          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Payment Status</span>
            <span className="bg-marigold-100 text-marigold-900 text-xs font-bold px-2 py-1 rounded">
              {order.payment_status}
            </span>
          </div>`;

const replacement2 = `          <div className="flex justify-between items-center pb-4 border-b border-chai-200 mb-4">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Payment Status</span>
            <span className="bg-marigold-100 text-marigold-900 text-xs font-bold px-2 py-1 rounded">
              {order.payment_status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-espresso-600 uppercase tracking-wider">Expected Delivery</span>
            <span className="font-medium text-espresso-900">
              {order.created_at ? format(addDays(new Date(order.created_at), 8), 'MMMM d, yyyy') : format(addDays(new Date(), 8), 'MMMM d, yyyy')}
            </span>
          </div>`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/pages/shop/OrderConfirmation.tsx', code);
console.log("Patched OrderConfirmation.tsx");
