import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { SidebarFilters } from '../components/catalog/SidebarFilters';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetailModal } from '../components/catalog/ProductDetailModal';
import { useCatStore } from '../store/catStore';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Filter, X, RotateCcw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { activeCat, recommendations } = useCatStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLifeStage, setSelectedLifeStage] = useState('');
  const [selectedHealthFocus, setSelectedHealthFocus] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const searchQuery = searchParams.get('q') || '';

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

  // Fetch products whenever filters or search query changes
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

    if (searchQuery) {
      const timer = setTimeout(fetchProducts, 200);
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
    if (searchQuery) {
      setSearchParams((prev) => {
        prev.delete('q');
        return prev;
      });
    }
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedLifeStage ? 1 : 0) +
    (selectedHealthFocus ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Personalized Recommendation Banner (Compact & High Priority) */}
      {user && user.role !== 'ADMIN' && activeCat && recommendations.length > 0 && (
        <section className="bg-emerald-50/80 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs animate-page-enter">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Recommended for {activeCat.name} ({activeCat.lifeStage.toLowerCase()}) 🐾
                </h2>
                <p className="text-[11px] text-slate-500">
                  Formulas matched to {activeCat.name}'s specific nutritional requirements
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={setSelectedProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Two-Column Layout: Left Sidebar Filter + Right Product Catalog */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar Filter (Desktop Sticky + Mobile Drawer) */}
        <SidebarFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedLifeStage={selectedLifeStage}
          onSelectLifeStage={setSelectedLifeStage}
          selectedHealthFocus={selectedHealthFocus}
          onSelectHealthFocus={setSelectedHealthFocus}
          onResetFilters={handleResetFilters}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Column: Catalog, Quick Category Bar, & Products Grid */}
        <main className="flex-1 w-full space-y-4">
          
          {/* Top Bar: Quick Primary Category Tabs & Mobile Filter Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Quick Horizontal Category Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex-shrink-0 ${
                  selectedCategory === ''
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex-shrink-0 ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Mobile Filter Drawer Trigger Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Badges & Count Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-900 font-extrabold">{products.length}</span> products
              </p>

              {/* Active Filter Chips */}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200/60">
                  Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-amber-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedLifeStage && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200/60">
                  Stage: {selectedLifeStage.toLowerCase()}
                  <button onClick={() => setSelectedLifeStage('')} className="hover:text-amber-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedHealthFocus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200/60">
                  Focus: {selectedHealthFocus.replace(/_/g, ' ').toLowerCase()}
                  <button onClick={() => setSelectedHealthFocus('')} className="hover:text-amber-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchParams((prev) => {
                        prev.delete('q');
                        return prev;
                      });
                    }}
                    className="hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all filters
              </button>
            )}
          </div>

          {/* Product Grid */}
          {isInitialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 py-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-3 shadow-xs">
                  <div className="aspect-square bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs animate-scale-in space-y-3">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="text-base font-bold text-slate-800">No products match your selected filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search terms, life stage, or dietary health filters to discover more items.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-600/20 hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}

        </main>
      </div>

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
