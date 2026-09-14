import React, { useState } from 'react';
import { Category, LifeStage, HealthFocusType } from '../../types';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { Filter, X, Sparkles, RotateCcw, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface SidebarFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedLifeStage: string;
  onSelectLifeStage: (stage: string) => void;
  selectedHealthFocus: string;
  onSelectHealthFocus: (focus: string) => void;
  onResetFilters: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedLifeStage,
  onSelectLifeStage,
  selectedHealthFocus,
  onSelectHealthFocus,
  onResetFilters,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [categoryOpen, setCategoryOpen] = useState(true);
  const [lifeStageOpen, setLifeStageOpen] = useState(true);
  const [healthFocusOpen, setHealthFocusOpen] = useState(true);

  const hasActiveFilters = Boolean(selectedCategory || selectedLifeStage || selectedHealthFocus);

  const lifeStages: { label: string; value: LifeStage | ''; icon: string }[] = [
    { label: t.allLifeStages, value: '', icon: '🐾' },
    { label: t.kitten, value: 'KITTEN', icon: '🍼' },
    { label: t.adult, value: 'ADULT', icon: '🐈' },
    { label: t.senior, value: 'SENIOR', icon: '👑' },
  ];

  const healthFocuses: { label: string; value: HealthFocusType | '' }[] = [
    { label: t.allHealthFocuses, value: '' },
    { label: t.urinaryCare, value: 'URINARY_CARE' },
    { label: t.hairballControl, value: 'HAIRBALL_CONTROL' },
    { label: t.sensitiveDigestion, value: 'SENSITIVE_DIGESTION' },
    { label: t.kidneySupport, value: 'KIDNEY_SUPPORT' },
    { label: t.skinAndCoat, value: 'SKIN_AND_COAT' },
    { label: t.weightManagement, value: 'WEIGHT_MANAGEMENT' },
    { label: t.dentalCare, value: 'DENTAL_CARE' },
    { label: t.generalWellness, value: 'GENERAL_WELLNESS' },
  ];

  const filterContent = (
    <div className="space-y-6">
      {/* Sidebar Header with Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t.filterProducts}</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t.clearAll}
          </button>
        )}
      </div>

      {/* 1. Category Section (Vertical List) */}
      <div className="space-y-2.5">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800"
        >
          <span>{t.category}</span>
          {categoryOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {categoryOpen && (
          <div className="space-y-1 pl-0.5 animate-fade-in">
            <button
              onClick={() => onSelectCategory('')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                selectedCategory === ''
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{t.allCategories}</span>
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? '' : cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat._count?.products !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}>
                      {cat._count.products}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Life Stage Section (Vertical Options) */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={() => setLifeStageOpen(!lifeStageOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800"
        >
          <span>{t.lifeStage}</span>
          {lifeStageOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {lifeStageOpen && (
          <div className="space-y-1 pl-0.5 animate-fade-in">
            {lifeStages.map((stage) => {
              const isSelected = selectedLifeStage === stage.value;
              return (
                <button
                  key={stage.label}
                  onClick={() => onSelectLifeStage(isSelected ? '' : stage.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stage.icon}</span>
                    <span>{stage.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Specialty Health Focus (Neutral Clean Vertical Tags) */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={() => setHealthFocusOpen(!healthFocusOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.healthDietFocus}</span>
          </div>
          {healthFocusOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {healthFocusOpen && (
          <div className="flex flex-col gap-1 pl-0.5 animate-fade-in">
            {healthFocuses.map((focus) => {
              const isSelected = selectedHealthFocus === focus.value;
              return (
                <button
                  key={focus.label}
                  onClick={() => onSelectHealthFocus(isSelected ? '' : focus.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{focus.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <span className="font-black text-base text-slate-900">{t.filters}</span>
                <button onClick={onCloseMobile} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-600/20"
              >
                {t.filterProducts}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
