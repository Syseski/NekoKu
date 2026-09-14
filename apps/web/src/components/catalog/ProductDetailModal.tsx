import React, { useState } from 'react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useCatStore } from '../../store/catStore';
import { X, Star, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { formatRM } from '../../utils/format';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addItem } = useCartStore();
  const { user, openAuthModal } = useAuthStore();
  const { activeCat } = useCatStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const isAdmin = user?.role === 'ADMIN';

  const handleAddToCart = async () => {
    if (isAdmin) return;
    if (!user) {
      onClose();
      openAuthModal();
      return;
    }
    try {
      setIsAdding(true);
      await addItem(product.id, quantity);
      setTimeout(() => {
        setIsAdding(false);
        onClose();
      }, 500);
    } catch {
      setIsAdding(false);
    }
  };

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100 my-auto flex flex-col max-h-[88vh] animate-scale-in"
      >
        
        {/* Header - Fixed & Always Visible */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.brand}</span>
            {product.isSpecialtyDiet && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Veterinary Formula
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            
            {/* Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{product.name}</h3>

              {/* Rating */}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                <span>• {product.ratingCount} reviews</span>
              </div>

              {/* Price */}
              <div className="py-2">
                <span className="text-2xl font-black text-slate-900 font-sans">{formatRM(product.price)}</span>
                <span className="text-xs text-slate-400 ml-2">Stock: {product.stockQuantity} available</span>
              </div>

              {/* Active Cat Match Alert */}
              {activeCat && !isAdmin && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Active Cat: {activeCat.name} ({activeCat.lifeStage.toLowerCase()})</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Target stage: <span className="font-semibold">{product.targetLifeStage.toLowerCase()}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Target Health Focuses */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Health Benefits</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.healthFocuses.map((hf) => (
                    <span
                      key={hf.id || hf.focus}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200"
                    >
                      {hf.focus.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Description & Care Guide</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Ingredients */}
          {product.ingredients && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Key Ingredients & Nutritional Breakdown</h4>
              <p className="text-xs text-slate-600 leading-relaxed italic">{product.ingredients}</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          {isAdmin ? (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Mode: Catalog Preview Only</span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition hover:scale-105 active:scale-95"
              >
                Close Preview
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Qty:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stockQuantity === 0}
                className="flex-1 max-w-xs flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition hover:scale-[1.02] disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add {formatRM(Number(product.price) * quantity)}
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
