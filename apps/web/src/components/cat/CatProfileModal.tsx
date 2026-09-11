import React, { useState, useEffect } from 'react';
import { useCatStore } from '../../store/catStore';
import { HealthFocusType, LifeStage } from '../../types';
import { X, Sparkles, Check, CheckCircle2 } from 'lucide-react';

interface CatProfileModalProps {
  onClose: () => void;
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

const PRESET_AVATARS = [
  { label: 'British Shorthair', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80' },
  { label: 'Scottish Fold', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80' },
  { label: 'Tabby Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80' },
  { label: 'Ginger Cat', url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80' },
  { label: 'Black Cat', url: 'https://images.unsplash.com/photo-1503777119540-ce54b422baff?auto=format&fit=crop&w=400&q=80' },
  { label: 'Fluffy White', url: 'https://images.unsplash.com/photo-1513360309081-36f20ca480d0?auto=format&fit=crop&w=400&q=80' },
];

export const CatProfileModal: React.FC<CatProfileModalProps> = ({ onClose }) => {
  const { addCat } = useCatStore();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [lifeStage, setLifeStage] = useState<LifeStage>('ADULT');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [isNeutered, setIsNeutered] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [allergies, setAllergies] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<HealthFocusType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const toggleConcern = (condition: HealthFocusType) => {
    setSelectedConcerns((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your cat's name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await addCat({
        name: name.trim(),
        breed: breed.trim() || undefined,
        lifeStage,
        weightKg: weightKg ? Number(weightKg) : undefined,
        isNeutered,
        avatarUrl: avatarUrl.trim() || undefined,
        allergies: allergies.trim() || undefined,
        healthConcerns: selectedConcerns,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      const msg = typeof err.response?.data?.message === 'string'
        ? err.response.data.message
        : err.message || 'Failed to create cat profile';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100 my-auto flex flex-col max-h-[88vh] animate-scale-in"
      >
        
        {/* Header - Fixed & Always Visible */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-brand-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Register Cat Profile</h3>
              <p className="text-[11px] text-slate-500">Personalized feline nutrition & health matching</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 animate-badge-wiggle" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Profile Registered! 🐾</h4>
            <p className="text-xs text-slate-500 font-medium">
              Updating dietary recommendations for <strong>{name}</strong>...
            </p>
          </div>
        ) : (
          /* Form with Scrollable Body and Sticky Footer */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200/60">
                  {error}
                </div>
              )}

              {/* Quick Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Choose Avatar / Cat Photo</label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(avatar.url)}
                      className={`relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        avatarUrl === avatar.url
                          ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                      {avatarUrl === avatar.url && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-brand-500 rounded-tl-md flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cat's Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mochi, Luna, Oyen"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Breed</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. British Shorthair, DSH"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Life Stage</label>
                  <select
                    value={lifeStage}
                    onChange={(e) => setLifeStage(e.target.value as LifeStage)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="KITTEN">🍼 Kitten (0 - 12 months)</option>
                    <option value="ADULT">🐈 Adult (1 - 7 years)</option>
                    <option value="SENIOR">👑 Senior (7+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 4.5"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Neutered / Spayed Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="neutered"
                      checked={isNeutered}
                      onChange={() => setIsNeutered(true)}
                      className="accent-brand-500"
                    />
                    <span>Yes, Neutered / Spayed ✂️</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="neutered"
                      checked={!isNeutered}
                      onChange={() => setIsNeutered(false)}
                      className="accent-brand-500"
                    />
                    <span>No, Intact</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies / Sensitivities</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Chicken by-products, gluten, grains"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Health Focuses */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Health Concerns & Dietary Goals (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HEALTH_OPTIONS.map((opt) => {
                    const isSelected = selectedConcerns.includes(opt.value);
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => toggleConcern(opt.value)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-medium transition ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
            </div>

            {/* Sticky Footer - Always Visible */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0 z-10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                Cancel / Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Profile...' : 'Save Cat Profile & Update Recommendations 🐾'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
