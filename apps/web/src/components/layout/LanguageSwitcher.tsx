import React from 'react';
import { useLanguageStore } from '../../store/languageStore';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="inline-flex items-center bg-slate-100 hover:bg-slate-200/80 p-0.5 rounded-full border border-slate-200 shadow-xs transition-colors flex-shrink-0">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        title="Switch to English"
        className={`flex items-center justify-center px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all duration-200 ${
          language === 'en'
            ? 'bg-amber-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ms')}
        title="Tukar ke Bahasa Melayu"
        className={`flex items-center justify-center px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all duration-200 ${
          language === 'ms'
            ? 'bg-amber-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>BM</span>
      </button>
    </div>
  );
};
