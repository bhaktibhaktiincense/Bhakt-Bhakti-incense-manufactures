import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface InvoiceTemplateProps {
  order: any;
  orderItems?: any[];
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order, orderItems, id, className, style }, ref) => {
  if (!order) return null;

  // Resolve items from orderItems prop, order.order_items, or order.items snapshot
  const displayItems = (orderItems && orderItems.length > 0)
    ? orderItems
    : (Array.isArray(order.order_items) && order.order_items.length > 0)
      ? order.order_items
      : (Array.isArray(order.items) && order.items.length > 0)
        ? order.items
        : [];

  const subtotalNum = Number(order.subtotal) > 0 
    ? Number(order.subtotal) 
    : displayItems.reduce((acc: number, it: any) => acc + ((Number(it.price) || Number(it.unit_price) || 0) * (Number(it.quantity) || 1)), 0);

  const discountNum = Number(order.discount) || Number(order.discount_amount) || 0;
  const totalNum = Number(order.total) > 0 ? Number(order.total) : subtotalNum;
  const explicitShipping = order.shipping_charge ?? order.shipping_amount;
  const shippingCharge = explicitShipping !== undefined 
    ? Number(explicitShipping) 
    : Math.max(0, totalNum - subtotalNum + discountNum);
  const finalTotal = totalNum > 0 ? totalNum : (subtotalNum - discountNum + shippingCharge);

  const orderIdentifier = order.order_number 
    || (typeof order.id === 'string' && order.id.startsWith('BB') ? order.id : `BB-ORD-${String(order.id).padStart(6, '0')}`);

  let formattedDate = 'N/A';
  if (order.created_at) {
    try {
      formattedDate = format(new Date(order.created_at), 'MMMM d, yyyy');
    } catch {
      formattedDate = String(order.created_at).slice(0, 10);
    }
  }

  return (
    <div 
      id={id || 'invoice-content'}
      ref={ref} 
      // A4 is roughly 210x297mm. At 96 DPI, that's 794x1123 pixels.
      className={`bg-white text-espresso-900 p-8 sm:p-10 w-[794px] min-h-[1050px] box-border relative flex flex-col invoice-printable ${className || ''}`}
      style={style}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-marigold-500 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-marigold-600 uppercase tracking-widest block mb-1">
            Official Tax Invoice
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-bold mb-1">Bhakt & Bhakti</h1>
          <p className="text-xs text-espresso-600 font-medium">Premium Handcrafted Agarbatti & Spiritual Fragrances</p>
          <p className="text-xs text-espresso-600 mt-1">Support: <span className="font-semibold text-espresso-800">bbincensemanufacters@gmail.com</span></p>
        </div>
        <div className="text-right">
          <h2 className="font-serif text-2xl sm:text-3xl text-espresso-900 uppercase tracking-widest font-bold mb-2">Invoice</h2>
          <div className="bg-chai-100 px-3 py-1.5 rounded border border-chai-200 inline-block text-left mb-1.5">
            <span className="text-[10px] uppercase font-bold text-espresso-500 block">Order Reference</span>
            <span className="font-mono text-xs font-bold text-espresso-900">{orderIdentifier}</span>
          </div>
          <p className="text-xs text-espresso-700">
            Invoice Date: <span className="font-bold text-espresso-900">{formattedDate}</span>
          </p>
        </div>
      </div>

      {/* Customer & Shipping Addresses */}
      <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-chai-200">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-2.5 pb-1 border-b border-chai-200">
            Customer / Billed To
          </h3>
          <p className="font-bold text-base text-espresso-900 mb-1">
            {order.customer_name || order.name || 'Valued Devotee'}
          </p>
          {order.phone && (
            <p className="text-xs text-espresso-700 mb-0.5">
              <span className="font-semibold text-espresso-500">Mobile:</span> {order.phone}
            </p>
          )}
          {order.email && (
            <p className="text-xs text-espresso-700 mb-0.5">
              <span className="font-semibold text-espresso-500">Email:</span> {order.email}
            </p>
          )}
          {order.order_notes && (
            <div className="mt-2 text-[11px] text-espresso-600 bg-chai-50 p-2 rounded border border-chai-200">
              <span className="font-bold block">Delivery Note:</span>
              {order.order_notes}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-500 mb-2.5 pb-1 border-b border-chai-200">
            Shipped To (Delivery Destination)
          </h3>
          <p className="text-xs text-espresso-800 leading-relaxed whitespace-pre-wrap font-medium">
            {order.shipping_address || 'Standard Delivery Address'}
          </p>
          <div className="mt-3 text-xs text-espresso-600">
            <span className="font-semibold text-espresso-500">Payment Mode:</span>{' '}
            <span className="font-bold text-espresso-900">{order.payment_method || 'Cash on Delivery (COD)'}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8 flex-grow">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-chai-100 text-espresso-900 border-b border-chai-200">
              <th className="py-3 px-3 uppercase font-bold tracking-wider text-center w-12">#</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">Fragrance Item / Description</th>
              <th className="py-3 px-3 uppercase font-bold tracking-wider text-center w-20">Qty</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider text-right w-28">Unit Price</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chai-100 border-b border-chai-200">
            {displayItems.length > 0 ? (
              displayItems.map((item: any, index: number) => {
                const itemQty = Number(item.quantity) || 1;
                const itemPrice = Number(item.price) || Number(item.unit_price) || 0;
                const lineTotal = itemPrice * itemQty;

                return (
                  <tr key={item.id || item.product_id || index}>
                    <td className="py-3.5 px-3 text-center text-espresso-500 font-mono">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-espresso-900">
                        {item.product_name || item.name || 'Sacred Incense Fragrance'}
                      </div>
                      {item.product_id && (
                        <div className="text-[10px] text-espresso-400 font-mono mt-0.5">
                          SKU: {item.product_id}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-espresso-900 bg-chai-50/50">
                      {itemQty}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif text-espresso-800 font-semibold">
                      ₹{itemPrice}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-espresso-900">
                      ₹{lineTotal}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-espresso-500 italic">
                  Order details loaded from database. Order items list unavailable.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-chai-50 p-5 rounded-lg border border-chai-200 text-xs">
          <div className="flex justify-between py-1.5 text-espresso-700">
            <span className="font-medium">Subtotal</span>
            <span className="font-serif font-bold text-espresso-900">₹{subtotalNum}</span>
          </div>

          {discountNum > 0 && (
            <div className="flex justify-between py-1.5 text-emerald-700">
              <span className="font-medium">Discount</span>
              <span className="font-serif font-bold">-₹{discountNum}</span>
            </div>
          )}

          <div className="flex justify-between py-1.5 text-espresso-700">
            <span className="font-medium">Delivery Charges</span>
            <span className="font-serif font-bold text-espresso-900">
              {shippingCharge > 0 ? `₹${shippingCharge}` : 'FREE (Complimentary)'}
            </span>
          </div>

          <div className="flex justify-between mt-3 pt-3 border-t-2 border-chai-200 text-sm font-bold text-espresso-900">
            <span>Total Payable</span>
            <span className="font-serif text-base text-kumkum-600 font-bold">₹{finalTotal}</span>
          </div>
        </div>
      </div>

      {/* Footer & Authenticity Stamp */}
      <div className="border-t border-chai-200 pt-5 flex justify-between items-end mt-auto text-xs">
        <div>
          <span className="text-[10px] text-espresso-500 font-bold uppercase tracking-wider block mb-1">
            Payment & Fulfillment
          </span>
          <span className="font-bold text-espresso-900 bg-marigold-100/80 px-2.5 py-1 rounded border border-marigold-300 inline-block">
            {order.payment_status || (order.payment_method ? `${order.payment_method} - Pending` : 'Cash on Delivery (Pending)')}
          </span>
          <p className="text-[10px] text-espresso-400 mt-2">
            Computer generated invoice. No signature required.
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif italic text-espresso-800 text-base font-medium">Thank you for your devotion.</p>
          <p className="text-[11px] text-espresso-500 mt-0.5">Bhakt & Bhakti Incense — Spreading Serenity & Fragrance</p>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
