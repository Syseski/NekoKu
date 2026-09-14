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
  const { user, openAuthModal } = useAuthStore();
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
    if (!user) {
      openAuthModal();
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
      className="group bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs hover:shadow-lg hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
    >
      {/* Subtle Cat Recommendation Badge in Top-Right */}
      {isMatchingCat && activeCat && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs">
          <Sparkles className="w-3 h-3 text-emerald-200" />
          <span>For {activeCat.name}</span>
        </div>
      )}

      {/* Specialty Diet Pill in Top-Left */}
      {product.isSpecialtyDiet && (
        <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 text-[10px] font-bold border border-slate-200/80 backdrop-blur-xs">
          Vet Care
        </div>
      )}

      {/* Consistent Aspect-Square Image Container on Clean White Background */}
      <div className="relative aspect-square w-full rounded-2xl bg-white border border-slate-100 p-3 mb-3.5 flex items-center justify-center overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
        {product.stockQuantity <= 5 && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
            {product.stockQuantity} left
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        {/* Brand & Life Stage */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {product.brand}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize flex-shrink-0">
            {product.targetLifeStage === 'ALL_STAGES' ? 'All Ages' : product.targetLifeStage.toLowerCase()}
          </span>
        </div>

        {/* Product Title */}
        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors duration-200">
          {product.name}
        </h4>

        {/* Health Focus Chips (Neutral styling) */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          {product.healthFocuses.slice(0, 2).map((hf) => (
            <span
              key={hf.id || hf.focus}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
            >
              {hf.focus.replace(/_/g, ' ').toLowerCase()}
            </span>
          ))}
          {product.healthFocuses.length > 2 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
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
          <span className="text-[11px] text-slate-400">({product.ratingCount})</span>
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
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 hover:scale-105 active:scale-95'
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
