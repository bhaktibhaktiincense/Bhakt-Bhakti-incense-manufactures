import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface InvoiceTemplateProps {
  order: any;
  orderItems: any[];
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order, orderItems, id, className, style }, ref) => {
  if (!order) return null;

  const shippingCharge = (order.total || 0) - (order.subtotal || 0);

  return (
    <div 
      id={id}
      ref={ref} 
      // A4 is roughly 210x297mm. At 96 DPI, that's 794x1123 pixels.
      // We set a fixed width and minimum height to match A4 proportions.
      className={`bg-white text-espresso-900 p-10 w-[794px] min-h-[1123px] box-border relative flex flex-col ${className || ''}`}
      style={style}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-marigold-500 pb-8 mb-8">
        <div>
          <h1 className="font-serif text-4xl text-marigold-600 mb-2">Bhakt & Bhakti</h1>
          <p className="text-sm text-espresso-600">Premium Incense & Spiritual Goods</p>
          <p className="text-sm text-espresso-600 font-bold mt-1">Contact: bbincensemanufacters@gmail.com</p>
        </div>
        <div className="text-right">
          <h2 className="font-serif text-3xl text-espresso-900 uppercase tracking-widest mb-2">Invoice</h2>
          <p className="text-sm font-bold text-espresso-700">
            Order ID: <span className="font-mono text-espresso-900 font-normal">{String(order.id).toUpperCase()}</span>
          </p>
          <p className="text-sm font-bold text-espresso-700 mt-1">
            Date: <span className="font-normal">{order.created_at ? format(new Date(order.created_at), 'MMMM d, yyyy') : 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Customer & Shipping */}
      <div className="flex justify-between mb-8">
        <div className="w-1/2 pr-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-3 border-b border-chai-200 pb-1">Billed To</h3>
          <p className="font-bold text-lg mb-1">{order.customer_name || 'Customer'}</p>
          {order.email && <p className="text-sm mb-1">{order.email}</p>}
          {order.phone && <p className="text-sm">{order.phone}</p>}
        </div>
        <div className="w-1/2 pl-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-3 border-b border-chai-200 pb-1">Shipped To</h3>
          <p className="text-sm whitespace-pre-wrap">{order.shipping_address}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-chai-100 text-espresso-900">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center w-12">S.No.</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Product Name</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Quantity</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center">Unit</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Unit Price</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chai-100 border-b border-chai-200">
            {orderItems?.map((item: any, index: number) => (
              <tr key={item.id || index}>
                <td className="py-4 px-4 text-center text-sm text-espresso-700">{index + 1}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-espresso-800">{item.product_name || 'Item'}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-sm text-espresso-700">{item.quantity || 1}</td>
                <td className="py-4 px-4 text-center text-sm text-espresso-700">Pcs</td>
                <td className="py-4 px-4 text-right text-sm text-espresso-700 font-serif">₹{item.price || 0}</td>
                <td className="py-4 px-4 text-right font-serif font-bold text-espresso-900">₹{(item.price || 0) * (item.quantity || 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 bg-chai-50 p-6 rounded border border-chai-200">
          <div className="flex justify-between mb-3 text-sm text-espresso-700">
            <span>Subtotal</span>
            <span className="font-serif">₹{order.subtotal || 0}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between mb-3 text-sm text-green-700">
              <span>Discount</span>
              <span className="font-serif">-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between mb-3 text-sm text-espresso-700">
            <span>Shipping Charge</span>
            <span className="font-serif">{shippingCharge > 0 ? `₹${shippingCharge}` : 'Free'}</span>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-chai-200 text-lg font-bold text-espresso-900">
            <span>Grand Total</span>
            <span className="font-serif text-kumkum-600">₹{order.total || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-chai-200 pt-6 flex justify-between items-end mt-auto">
        <div>
          <p className="text-xs text-espresso-500 font-bold uppercase tracking-wider mb-1">Payment Status</p>
          <p className="text-sm font-bold text-espresso-900 bg-marigold-100 px-3 py-1 rounded inline-block">{order.payment_status || 'Pending'}</p>
        </div>
        <div className="text-right">
          <p className="font-serif italic text-espresso-600 text-lg">Thank you for your order.</p>
          <p className="text-xs text-espresso-500 mt-1">May the fragrance bring peace and devotion.</p>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
