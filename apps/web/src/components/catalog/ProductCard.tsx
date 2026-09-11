import React, { useState } from 'react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useCatStore } from '../../store/catStore';
import { Star, ShoppingBag, Check, Eye, Sparkles } from 'lucide-react';
import { formatRM } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addItem, isLoading } = useCartStore();
  const { user } = useAuthStore();
  const { activeCat } = useCatStore();
  const [isAdding, setIsAdding] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Check if product matches active cat's health concerns or life stage
  const productFocuses = Array.isArray(product.healthFocuses) ? product.healthFocuses : [];
  const catConcerns = Array.isArray(activeCat?.healthConcerns) ? activeCat.healthConcerns : [];

  const matchingCatConcerns = activeCat
    ? productFocuses.filter((hf) =>
        catConcerns.some((hc) => (typeof hc === 'string' ? hc : hc?.condition) === hf?.focus)
      )
    : [];

  const isMatchingCat = Boolean(
    !isAdmin &&
    activeCat &&
    (matchingCatConcerns.length > 0 ||
      (product.targetLifeStage && product.targetLifeStage === activeCat.lifeStage))
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin) {
      onOpenDetails(product);
      return;
    }
    try {
      setIsAdding(true);
      await addItem(product.id, 1);
      setTimeout(() => setIsAdding(false), 800);
    } catch (error) {
      setIsAdding(false);
    }
  };

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-3xl border border-orange-100/70 p-4 shadow-xs product-card-hover flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.98]"
    >
      {/* Cat Recommendation Banner Badge */}
      {isMatchingCat && activeCat && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold shadow-md shadow-emerald-500/30 animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5 animate-badge-wiggle" />
          <span>Ideal for {activeCat.name} 🐾</span>
        </div>
      )}

      {/* Specialty Diet Pill */}
      {product.isSpecialtyDiet && !isMatchingCat && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 shadow-xs">
          Veterinary Care
        </div>
      )}

      {/* Image Container with Zoom */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3.5">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {product.stockQuantity <= 5 && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs animate-pulse">
            Only {product.stockQuantity} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Brand & Life Stage */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {product.brand}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
            {product.targetLifeStage === 'ALL_STAGES' ? 'All Ages' : product.targetLifeStage.toLowerCase()}
          </span>
        </div>

        {/* Product Title */}
        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors duration-200">
          {product.name}
        </h4>

        {/* Health Focus Chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.healthFocuses.slice(0, 2).map((hf) => (
            <span
              key={hf.id || hf.focus}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200/50"
            >
              {hf.focus.replace(/_/g, ' ').toLowerCase()}
            </span>
          ))}
          {product.healthFocuses.length > 2 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
              +{product.healthFocuses.length - 2}
            </span>
          )}
        </div>

        {/* Reviews */}
        <div className="flex items-center gap-1 mb-3 text-xs text-slate-500">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800 ml-1">{product.rating.toFixed(1)}</span>
          </div>
          <span>({product.ratingCount})</span>
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block -mb-0.5 font-medium">Price</span>
            <span className="text-base font-black text-slate-900 font-sans">
              {formatRM(product.price)}
            </span>
          </div>

          {isAdmin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(product);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all duration-200 hover:scale-105"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isLoading || product.stockQuantity === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shadow-sm ${
                isAdding
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20 hover:scale-105 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-scale-in" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
