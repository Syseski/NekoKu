import React, { useState } from 'react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useCatStore } from '../../store/catStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
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
  const { language } = useLanguageStore();
  const t = translations[language];

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

  const getStageLabel = (stage: string) => {
    if (stage === 'ALL_STAGES') return t.allAges;
    if (stage === 'KITTEN') return language === 'ms' ? 'Anak' : 'Kitten';
    if (stage === 'ADULT') return language === 'ms' ? 'Dewasa' : 'Adult';
    if (stage === 'SENIOR') return 'Senior';
    return stage.toLowerCase();
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-2.5 sm:p-4 shadow-xs hover:shadow-lg hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
    >
      {/* Subtle Cat Recommendation Badge in Top-Right */}
      {isMatchingCat && activeCat && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[9px] sm:text-[10px] font-bold shadow-xs backdrop-blur-xs">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-200" />
          <span className="truncate max-w-[70px] sm:max-w-none">{t.forCat.replace('{name}', activeCat.name)}</span>
        </div>
      )}

      {/* Specialty Diet Pill in Top-Left */}
      {product.isSpecialtyDiet && (
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 text-[9px] sm:text-[10px] font-bold border border-slate-200/80 backdrop-blur-xs">
          {t.vetCare}
        </div>
      )}

      {/* Consistent Aspect-Square Image Container on Clean White Background */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-white border border-slate-100 p-2 sm:p-3 mb-2 sm:mb-3.5 flex items-center justify-center overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
        {product.stockQuantity <= 5 && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1 sm:px-1.5 py-0.5 rounded shadow-xs">
            {t.onlyLeft.replace('{count}', String(product.stockQuantity))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        {/* Brand & Life Stage */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {product.brand}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize flex-shrink-0">
            {getStageLabel(product.targetLifeStage)}
          </span>
        </div>

        {/* Product Title */}
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 sm:mb-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-amber-600 transition-colors duration-200">
          {product.name}
        </h4>

        {/* Health Focus Chips (Neutral styling) */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.healthFocuses.slice(0, 1).map((hf) => (
            <span
              key={hf.id || hf.focus}
              className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-full"
            >
              {hf.focus.replace(/_/g, ' ').toLowerCase()}
            </span>
          ))}
          {product.healthFocuses.length > 1 && (
            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
              +{product.healthFocuses.length - 1}
            </span>
          )}
        </div>

        {/* Reviews */}
        <div className="flex items-center gap-1 mb-2.5 text-[10px] sm:text-xs text-slate-500">
          <div className="flex items-center text-amber-500">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800 ml-0.5 sm:ml-1">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-400">({product.ratingCount})</span>
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block -mb-0.5 font-medium">{t.price}</span>
            <span className="text-sm sm:text-base font-black text-slate-900 font-sans">
              {formatRM(product.price)}
            </span>
          </div>

          {isAdmin ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(product);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] sm:text-xs font-bold transition-all duration-200 hover:scale-105"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{t.view}</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isLoading || product.stockQuantity === 0}
              className={`flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-xs ${
                isAdding
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 hover:scale-105 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-scale-in" />
                  <span>{t.added}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{t.add}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
