import React, { useState } from 'react';
import { Product, Category } from '../../types';
import { formatRM } from '../../utils/format';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { AdminProductModal } from './AdminProductModal';

interface AdminProductSectionProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onDeleteProduct: (productId: string, name: string) => Promise<void>;
}

export const AdminProductSection: React.FC<AdminProductSectionProps> = ({
  products,
  categories,
  onRefresh,
  onUpdateStock,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ingredients && p.ingredients.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;

    let matchesStock = true;
    if (selectedStockFilter === 'LOW') matchesStock = p.stockQuantity > 0 && p.stockQuantity <= 10;
    if (selectedStockFilter === 'OUT') matchesStock = p.stockQuantity === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Action & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product name, brand, ingredients..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Stock Status</option>
            <option value="LOW">Low Stock Alert (≤ 10)</option>
            <option value="OUT">Out of Stock (0)</option>
          </select>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>

      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Product & Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Life Stage</th>
                <th className="py-3.5 px-4">Health Focus</th>
                <th className="py-3.5 px-4">Price (RM)</th>
                <th className="py-3.5 px-4">Stock Quantity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const imgUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80';
                  const isLowStock = product.stockQuantity <= 10 && product.stockQuantity > 0;
                  const isOutOfStock = product.stockQuantity === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={imgUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">{product.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{product.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {product.category?.name || categories.find((c) => c.id === product.categoryId)?.name || 'Cat Care'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold capitalize">
                          {product.targetLifeStage === 'ALL_STAGES' ? 'All Stages' : product.targetLifeStage.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.healthFocuses && product.healthFocuses.length > 0 ? (
                            product.healthFocuses.map((hf) => (
                              <span
                                key={hf.id || hf.focus}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                {hf.focus.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">General</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold font-sans text-slate-900">
                        {formatRM(product.price)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            defaultValue={product.stockQuantity}
                            onBlur={(e) => onUpdateStock(product.id, Number(e.target.value))}
                            className={`w-16 px-2 py-1 border rounded-lg text-xs font-bold text-center ${
                              isOutOfStock
                                ? 'bg-red-50 border-red-300 text-red-700'
                                : isLowStock
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setProductToEdit(product);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id, product.name)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No products found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AdminProductModal
          categories={categories}
          productToEdit={productToEdit}
          onClose={() => setIsModalOpen(false)}
          onSaved={onRefresh}
        />
      )}

    </div>
  );
};
