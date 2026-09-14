import React, { useState, useEffect } from 'react';
import { useCatStore } from '../store/catStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLanguageStore } from '../store/languageStore';
import { translations, t } from '../utils/translations';
import { CatProfileModal } from '../components/cat/CatProfileModal';
import { CatProfile, CatHealthConcern } from '../types';
import { Plus, Trash2, Sparkles, CheckCircle2, UserCheck, Heart } from 'lucide-react';

export const CatProfilesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { cats, activeCat, setActiveCat, deleteCat, fetchCats } = useCatStore();
  const { language } = useLanguageStore();
  const currentT = translations[language] || translations.en;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCats();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-brand-500 flex items-center justify-center mx-auto shadow-md shadow-brand-500/10">
          <Heart className="w-8 h-8 fill-brand-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{currentT.manageCatProfiles}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentT.signInCatDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-wiggle">🐱</span>
            <h1 className="text-2xl font-black text-slate-900">{currentT.catProfilesTitle}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentT.catProfilesSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          {currentT.addCatProfile}
        </button>
      </div>

      {/* Cat Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cats.map((cat: CatProfile) => {
          const isSelected = activeCat?.id === cat.id;
          return (
            <div
              key={cat.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 ease-out relative flex flex-col justify-between shadow-xs hover:-translate-y-1 hover:shadow-lg ${
                isSelected
                  ? 'border-brand-400 ring-2 ring-brand-500/20 shadow-lg shadow-brand-500/10'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-xs flex items-center justify-center">
                      {cat.avatarUrl ? (
                        <img src={cat.avatarUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🐾</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-lg">{cat.name}</h3>
                        {isSelected && (
                          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-scale-in">
                            <CheckCircle2 className="w-3 h-3" /> {currentT.activeBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 capitalize">
                        {cat.breed || currentT.domesticCat} • {String(cat.lifeStage || 'adult').toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(t('deleteConfirm', language, { name: cat.name }))) {
                        deleteCat(cat.id);
                      }
                    }}
                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg transition"
                    title="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">{currentT.weight}</span>
                    <span className="font-bold text-slate-800">{cat.weightKg ? `${cat.weightKg} kg` : currentT.notSet}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">{currentT.status}</span>
                    <span className="font-bold text-slate-800">{cat.isNeutered ? currentT.neutered : currentT.intact}</span>
                  </div>
                </div>

                {/* Health Concerns */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {currentT.healthConcerns}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(cat.healthConcerns) && cat.healthConcerns.length > 0 ? (
                      cat.healthConcerns.map((hc: any) => {
                        const conditionStr = typeof hc === 'string' ? hc : hc?.condition || '';
                        return (
                          <span
                            key={hc?.id || conditionStr}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {conditionStr.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">{currentT.noHealthIssues}</span>
                    )}
                  </div>
                </div>

                {cat.allergies && (
                  <p className="text-xs text-slate-500 mb-4">
                    <strong className="text-slate-700">{currentT.allergies}:</strong> {cat.allergies}
                  </p>
                )}
              </div>

              {/* Set as Active Switcher Button */}
              <button
                onClick={() => setActiveCat(cat)}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-orange-50 text-brand-700 hover:bg-orange-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSelected ? `Currently Shopping for ${cat.name}` : `Switch Active Cat to ${cat.name}`}
              </button>

            </div>
          );
        })}

        {cats.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-orange-100 p-8 shadow-xs animate-scale-in">
            <span className="text-4xl block mb-2 animate-bounce">🐾</span>
            <h3 className="text-base font-bold text-slate-800">{currentT.noCatsYet}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{currentT.catProfilesSubtitle}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              {currentT.addCatProfile}
            </button>
          </div>
        )}
      </div>

      {isModalOpen && <CatProfileModal onClose={() => setIsModalOpen(false)} />}

    </div>
  );
};
