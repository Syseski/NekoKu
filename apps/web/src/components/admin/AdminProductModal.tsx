import React, { useState } from 'react';
import { api } from '../../services/api';
import { Category, HealthFocusType, LifeStage, Product } from '../../types';
import { X, Sparkles, Check } from 'lucide-react';

interface AdminProductModalProps {
  categories: Category[];
  productToEdit?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const HEALTH_OPTIONS: { label: string; value: HealthFocusType }[] = [
  { label: 'Urinary Tract Care', value: 'URINARY_CARE' },
  { label: 'Hairball Control', value: 'HAIRBALL_CONTROL' },
  { label: 'Sensitive Stomach & Digestion', value: 'SENSITIVE_DIGESTION' },
  { label: 'Kidney / Renal Support', value: 'KIDNEY_SUPPORT' },
  { label: 'Skin & Shiny Coat', value: 'SKIN_AND_COAT' },
  { label: 'Weight Management', value: 'WEIGHT_MANAGEMENT' },
  { label: 'Dental & Tartar Care', value: 'DENTAL_CARE' },
  { label: 'General Vitality', value: 'GENERAL_WELLNESS' },
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  categories,
  productToEdit,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(productToEdit?.name || '');
  const [brand, setBrand] = useState(productToEdit?.brand || '');
  const [categoryId, setCategoryId] = useState(productToEdit?.categoryId || categories[0]?.id || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [ingredients, setIngredients] = useState(productToEdit?.ingredients || '');
  const [price, setPrice] = useState<number | ''>(productToEdit ? Number(productToEdit.price) : '');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(productToEdit?.stockQuantity ?? 50);
  const [targetLifeStage, setTargetLifeStage] = useState<LifeStage>(productToEdit?.targetLifeStage || 'ALL_STAGES');
  const [isSpecialtyDiet, setIsSpecialtyDiet] = useState(productToEdit?.isSpecialtyDiet || false);
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured || false);
  const [imageUrl, setImageUrl] = useState(productToEdit?.images?.[0]?.url || '');
  const [healthFocuses, setHealthFocuses] = useState<HealthFocusType[]>(
    productToEdit?.healthFocuses.map((h) => h.focus) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleHealthFocus = (focus: HealthFocusType) => {
    setHealthFocuses((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        name,
        brand,
        categoryId,
        description,
        ingredients: ingredients || undefined,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        targetLifeStage,
        isSpecialtyDiet,
        isFeatured,
        imageUrl: imageUrl || undefined,
        healthFocuses,
      };

      if (productToEdit) {
        await api.put(`/admin/products/${productToEdit.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-orange-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {productToEdit ? 'Edit Product Catalog' : 'Add New Specialty Product'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Royal Canin Urinary S/O"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand *</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Royal Canin, Hill's, Orijen"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (RM) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="49.99"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="50"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Life Stage</label>
              <select
                value={targetLifeStage}
                onChange={(e) => setTargetLifeStage(e.target.value as LifeStage)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="ALL_STAGES">All Life Stages</option>
                <option value="KITTEN">🍼 Kitten (0 - 12 months)</option>
                <option value="ADULT">🐈 Adult (1 - 7 years)</option>
                <option value="SENIOR">👑 Senior (7+ years)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Clinical formulation, nutritional benefits, guidelines..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Ingredients (Optional)</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={2}
              placeholder="Chicken meal, salmon oil, brewers rice, cranberries..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          {/* Health focuses */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Specialty Health Focus Tags
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HEALTH_OPTIONS.map((opt) => {
                const isSelected = healthFocuses.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleHealthFocus(opt.value)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpecialtyDiet}
                onChange={(e) => setIsSpecialtyDiet(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded"
              />
              <span>Veterinary Specialty Diet</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded"
              />
              <span>Featured Best-Seller</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
