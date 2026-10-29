import React, { useState } from 'react';
import { X, Check, Copy, MessageCircle, Send, Share2 } from 'lucide-react';
import { Product } from '../../types/product';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  shareUrl: string;
}

export const ProductShareModal: React.FC<Props> = ({
  isOpen,
  onClose,
  product,
  shareUrl
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promoMessage = `Experience the divine aroma of ${product.name} by Bhakt & Bhakti Incense. 100% Charcoal-Free handcrafted masala agarbatti:`;
  const encodedPromo = encodeURIComponent(promoMessage);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Copy link error:", e);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedPromo}%20${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedPromo}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedPromo}&url=${encodedUrl}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-chai-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-chai-200 bg-gradient-to-r from-orange-50 via-white to-amber-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-marigold-100 text-marigold-800 rounded-xl">
              <Share2 size={18} className="text-marigold-700" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-espresso-900">Share This Offering</h3>
              <p className="text-[11px] text-espresso-600">Spread divine aroma with family & friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-espresso-400 hover:text-espresso-800 hover:bg-chai-100 rounded-lg transition-colors"
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="p-5 border-b border-chai-100 bg-chai-50/50 flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-chai-200"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-espresso-900 truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-serif font-bold text-kumkum-600 text-sm">₹{product.price}</span>
              <span className="text-[11px] text-espresso-500 font-medium">• {product.unit || '100g'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                100% Charcoal-Free
              </span>
            </div>
          </div>
        </div>

        {/* Share buttons list */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all font-bold text-xs shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle size={16} />
              </div>
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-all font-bold text-xs shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Send size={16} />
              </div>
              <span>Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-all font-bold text-xs shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="font-bold text-sm">f</span>
              </div>
              <span>Facebook</span>
            </a>

            {/* Twitter / X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200 transition-all font-bold text-xs shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="font-bold text-xs">𝕏</span>
              </div>
              <span>X (Twitter)</span>
            </a>
          </div>

          {/* Copy Link Row */}
          <div>
            <label className="text-xs font-bold text-espresso-700 block mb-1.5">
              Direct Product Link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs bg-chai-50 border border-chai-200 rounded-xl px-3 py-2.5 text-espresso-800 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all flex-shrink-0 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-espresso-900 text-chai-50 hover:bg-espresso-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in">
                <Check size={12} className="stroke-[3]" /> Product link copied to clipboard! Ready to paste.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
