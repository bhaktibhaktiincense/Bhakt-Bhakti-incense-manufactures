import React from 'react';
import { Product } from '../../types/product';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isDeleting: boolean;
}

export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isDeleting
}: DeleteProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-chai-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>

          <h3 className="font-serif text-2xl text-espresso-900 font-bold mb-2">
            Delete Product?
          </h3>

          <p className="text-espresso-600 text-sm mb-6 leading-relaxed">
            Are you sure you want to remove <strong className="text-espresso-900 font-bold">"{product.name}"</strong> from your catalog? This will delete the product listing from the website.
          </p>

          <div className="bg-chai-50 p-3 rounded-xl border border-chai-200 flex items-center gap-3 text-left mb-6">
            <img src={product.image} alt={product.name} className="w-12 h-12 object-contain rounded bg-white p-1 border border-chai-200" />
            <div>
              <span className="font-bold text-espresso-900 text-xs block">{product.name}</span>
              <span className="text-[11px] text-espresso-500 font-mono">SKU: {product.sku || 'N/A'} • ₹{product.price}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 border border-espresso-300 text-espresso-800 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-chai-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
