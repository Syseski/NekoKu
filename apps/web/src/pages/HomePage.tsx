import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { SmartFilters } from '../components/catalog/SmartFilters';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetailModal } from '../components/catalog/ProductDetailModal';
import { useCatStore } from '../store/catStore';
import { useAuthStore } from '../store/authStore';
import { Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { activeCat, recommendations } = useCatStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLifeStage, setSelectedLifeStage] = useState('');
  const [selectedHealthFocus, setSelectedHealthFocus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [batchId, setBatchId] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters or search change
  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      try {
        setIsFiltering(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedLifeStage) params.append('lifeStage', selectedLifeStage);
        if (selectedHealthFocus) params.append('healthFocus', selectedHealthFocus);
        if (searchQuery) params.append('search', searchQuery);

        const res = await api.get(`/products?${params.toString()}`);
        if (!isCancelled) {
          setProducts(res.data.data.products);
          setBatchId((prev) => prev + 1);
          setIsInitialLoading(false);
          setIsFiltering(false);
        }
      } catch (err) {
        console.error('Failed to load products', err);
        if (!isCancelled) {
          setIsInitialLoading(false);
          setIsFiltering(false);
        }
      }
    };

    // If typing search query, debounce with 250ms. Otherwise execute immediately for instant snappy filtering.
    if (searchQuery) {
      const timer = setTimeout(fetchProducts, 250);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    } else {
      fetchProducts();
      return () => {
        isCancelled = true;
      };
    }
  }, [selectedCategory, selectedLifeStage, selectedHealthFocus, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedLifeStage('');
    setSelectedHealthFocus('');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Hero Banner with Animated Gradient & Floating Motion Elements */}
      <section className="relative rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white p-8 sm:p-12 overflow-hidden shadow-2xl shadow-brand-500/25 animate-hero-gradient animate-page-enter">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold tracking-wide shadow-md border border-white/30 animate-float-slow">
            <Sparkles className="w-4 h-4 text-amber-200 animate-badge-wiggle" />
            <span>CLINICALLY TARGETED FELINE NUTRITION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
            Specialty Diets for Every Cat's Unique Life Stage.
          </h1>

          <p className="text-sm sm:text-base text-orange-50 font-medium leading-relaxed drop-shadow-xs">
            From urinary health to sensitive digestion and senior kidney care — explore our complete range of certified veterinary and premium diets.
          </p>

          {activeCat && user?.role !== 'ADMIN' && (
            <div className="pt-2 animate-page-enter">
              <div className="inline-flex items-center gap-3 bg-white text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold hover:scale-105 transition-all duration-300">
                <span>🐾 Active Profile: <strong>{activeCat.name}</strong> ({String(activeCat.lifeStage || 'adult').toLowerCase()})</span>
                {Array.isArray(activeCat.healthConcerns) && activeCat.healthConcerns.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                    {activeCat.healthConcerns
                      .map((h: any) => (typeof h === 'string' ? h : h?.condition || '').replace(/_/g, ' '))
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Decorative Badges & Animated Mascot */}
        <div className="absolute right-8 top-12 hidden lg:flex flex-col gap-3 pointer-events-none z-10">
          <div className="animate-float-slow bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-2xl shadow-xl border border-white/40 flex items-center gap-2.5 text-xs font-bold">
            <span className="text-lg animate-wiggle">🐟</span>
            <div>
              <p className="leading-tight">100% Veterinary</p>
              <p className="text-[10px] text-slate-500 font-medium">Grade Ingredients</p>
            </div>
          </div>
          <div className="animate-float-reverse bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-2xl shadow-xl border border-white/40 flex items-center gap-2.5 text-xs font-bold ml-6">
            <span className="text-lg">✨</span>
            <div>
              <p className="leading-tight">Tailored Nutrition</p>
              <p className="text-[10px] text-slate-500 font-medium">Life-stage matching</p>
            </div>
          </div>
        </div>

        {/* Giant Floating Mascot */}
        <div className="absolute right-6 -bottom-6 text-9xl select-none pointer-events-none hidden md:block animate-float-mascot opacity-45 filter drop-shadow-2xl">
          🐈
        </div>
      </section>

      {/* 🐾 Personalized Recommendation Row (Visible when active cat has recommendations) */}
      {user && user.role !== 'ADMIN' && activeCat && recommendations.length > 0 && (
        <section className="space-y-4 bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200/70 shadow-xs animate-page-enter">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 animate-pulse-glow">
                <Sparkles className="w-5 h-5 animate-badge-wiggle" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recommended for {activeCat.name} 🐾
                </h2>
                <p className="text-xs text-slate-500">
                  Matched based on {activeCat.name}'s {activeCat.lifeStage.toLowerCase()} stage & health concerns
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((product) => (
              <div key={product.id} className="stagger-card">
                <ProductCard
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Catalog & Smart Filter Section */}
      <section className="space-y-6">
        <SmartFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedLifeStage={selectedLifeStage}
          onSelectLifeStage={setSelectedLifeStage}
          selectedHealthFocus={selectedHealthFocus}
          onSelectHealthFocus={setSelectedHealthFocus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onResetFilters={handleResetFilters}
        />

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
              Showing <span className="text-slate-900 font-black">{products.length}</span> specialty cat products
              {isFiltering && (
                <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              )}
            </p>
          </div>

          {isInitialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-3 shadow-xs">
                  <div className="aspect-square bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div
              key={batchId}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <div key={product.id} className="stagger-card">
                  <ProductCard
                    product={product}
                    onOpenDetails={setSelectedProduct}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-orange-100 p-8 shadow-xs animate-scale-in">
              <span className="text-4xl block mb-2 animate-bounce">🔍</span>
              <h3 className="text-base font-bold text-slate-800">No products match the selected filters</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing one of the life-stage or health focus filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
};
