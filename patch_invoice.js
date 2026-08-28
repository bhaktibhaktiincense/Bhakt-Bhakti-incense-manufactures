import fs from 'fs';

let code = fs.readFileSync('src/pages/shop/InvoiceViewer.tsx', 'utf8');

const target = `{/* Invoice Viewer container (Responsive handling for mobile viewing) */}
        <div className="w-full overflow-x-auto bg-white rounded shadow-sm border border-chai-200">
          <div className="min-w-[800px] flex justify-center py-8">
            <InvoiceTemplate 
              ref={invoiceRef} 
              order={order} 
              orderItems={orderItems} 
              className="shadow-sm" 
            />
          </div>
        </div>`;

const replacement = `{/* Invoice Viewer container (Responsive handling for mobile viewing) */}
        <div className="w-full bg-chai-100/50 rounded shadow-sm border border-chai-200 overflow-hidden flex justify-center p-2 sm:p-8">
          <div 
            className="origin-top"
            style={{
              transform: typeof window !== 'undefined' && window.innerWidth < 850 
                ? \`scale(\${(window.innerWidth - 32) / 850})\` 
                : 'scale(1)',
              height: typeof window !== 'undefined' && window.innerWidth < 850 
                ? \`calc(1123px * \${(window.innerWidth - 32) / 850})\` 
                : 'auto'
            }}
          >
            <InvoiceTemplate 
              ref={invoiceRef} 
              order={order} 
              orderItems={orderItems} 
              className="shadow-md bg-white border border-chai-200" 
            />
          </div>
        </div>`;

if(code.includes(target)) {
  fs.writeFileSync('src/pages/shop/InvoiceViewer.tsx', code.replace(target, replacement));
  console.log("Patched successfully");
} else {
  console.log("Target not found. Doing regex replacement");
  const fallbackTarget = /<div className="w-full overflow-x-auto bg-white rounded shadow-sm border border-chai-200">[\s\S]*?<\/div>\s*<\/div>/;
  fs.writeFileSync('src/pages/shop/InvoiceViewer.tsx', code.replace(fallbackTarget, replacement));
  console.log("Regex patch attempted.");
}
