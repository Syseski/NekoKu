import React from 'react';
import { Category, LifeStage, HealthFocusType } from '../../types';
import { Sparkles, Filter, X, Search } from 'lucide-react';

interface SmartFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedLifeStage: string;
  onSelectLifeStage: (stage: string) => void;
  selectedHealthFocus: string;
  onSelectHealthFocus: (focus: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

const LIFE_STAGES: { label: string; value: LifeStage | ''; icon: string }[] = [
  { label: 'All Ages', value: '', icon: '🐾' },
  { label: 'Kitten (0-12m)', value: 'KITTEN', icon: '🍼' },
  { label: 'Adult (1-7y)', value: 'ADULT', icon: '🐈' },
  { label: 'Senior (7+y)', value: 'SENIOR', icon: '👑' },
];

const HEALTH_FOCUSES: { label: string; value: HealthFocusType | ''; color: string }[] = [
  { label: 'All Health Focuses', value: '', color: 'bg-slate-100 text-slate-700' },
  { label: 'Urinary Care', value: 'URINARY_CARE', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Hairball Control', value: 'HAIRBALL_CONTROL', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { label: 'Sensitive Digestion', value: 'SENSITIVE_DIGESTION', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { label: 'Kidney Support', value: 'KIDNEY_SUPPORT', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { label: 'Skin & Coat Wellness', value: 'SKIN_AND_COAT', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { label: 'Weight Management', value: 'WEIGHT_MANAGEMENT', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { label: 'Dental Tartar Care', value: 'DENTAL_CARE', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
];

export const SmartFilters: React.FC<SmartFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedLifeStage,
  onSelectLifeStage,
  selectedHealthFocus,
  onSelectHealthFocus,
  searchQuery,
  onSearchChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(selectedCategory || selectedLifeStage || selectedHealthFocus || searchQuery);

  return (
    <div className="bg-white rounded-3xl p-5 border border-orange-100/80 shadow-sm space-y-5">
      
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-brand-600">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Smart Feline Filters</h3>
            <p className="text-xs text-slate-500">Filter by age, category, or clinical health needs</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ingredients, brand, diet..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition"
          >
            <X className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Category Bar */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? '' : cat.slug)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-slate-800 border border-orange-200/50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Life Stage Filter Chips */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cat Life Stage</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LIFE_STAGES.map((stage) => {
            const isSelected = selectedLifeStage === stage.value;
            return (
              <button
                key={stage.label}
                onClick={() => onSelectLifeStage(isSelected ? '' : stage.value)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold border transition ${
                  isSelected
                    ? 'bg-brand-50 border-brand-400 text-brand-900 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>{stage.icon}</span>
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Specialty Health Focus Condition Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-500" />
            Specialty Health & Dietary Focus
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
            {HEALTH_FOCUSES.map((focus) => {
              const isSelected = selectedHealthFocus === focus.value;
              return (
                <button
                  key={focus.label}
                  onClick={() => onSelectHealthFocus(isSelected ? '' : focus.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20 scale-[1.02]'
                      : `${focus.color} hover:opacity-85`
                  }`}
                >
                  {focus.label}
                </button>
              );
            })}
        </div>
      </div>

    </div>
  );
};
