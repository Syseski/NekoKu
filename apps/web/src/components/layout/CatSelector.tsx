import React, { useState, useRef, useEffect } from 'react';
import { useCatStore } from '../../store/catStore';
import { useAuthStore } from '../../store/authStore';
import { ChevronDown, Plus, Sparkles, Heart } from 'lucide-react';
import { CatProfileModal } from '../cat/CatProfileModal';

export const CatSelector: React.FC = () => {
  const { user } = useAuthStore();
  const { cats, activeCat, setActiveCat } = useCatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-orange-50 border border-orange-200 hover:border-brand-400 text-slate-800 transition shadow-xs text-xs sm:text-sm font-medium"
        >
          {activeCat ? (
            <>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-brand-200 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-brand-800">
                {activeCat.avatarUrl ? (
                  <img src={activeCat.avatarUrl} alt={activeCat.name} className="w-full h-full object-cover" />
                ) : (
                  '🐱'
                )}
              </div>
              <span className="truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px] text-slate-900 font-bold">
                {activeCat.name}
              </span>
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded bg-orange-200/70 text-orange-900 font-medium hidden md:inline-block">
                {String(activeCat.lifeStage || 'adult').toLowerCase()}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-slate-700 hidden xs:inline">Select Cat</span>
            </>
          )}
          <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Shopping for your cats
              </p>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {cats.map((cat) => {
                const isSelected = activeCat?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCat(cat);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                      isSelected
                        ? 'bg-brand-50 border border-brand-200 text-brand-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                        {cat.avatarUrl ? (
                          <img src={cat.avatarUrl} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base">🐾</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-slate-900 leading-tight">{cat.name}</p>
                          {isSelected && <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />}
                        </div>
                        <p className="text-xs text-slate-500 capitalize">
                          {cat.breed || 'Cat'} • {String(cat.lifeStage || 'adult').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {cats.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  No cat profiles registered yet.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 mt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Register New Cat Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && <CatProfileModal onClose={() => setIsAddModalOpen(false)} />}
    </>
  );
};
