import { create } from 'zustand';

export type Language = 'en' | 'ms';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('nekoku_language');
  if (saved === 'en' || saved === 'ms') return saved;
  return 'ms'; // Default to Bahasa Melayu or English
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    localStorage.setItem('nekoku_language', language);
    set({ language });
  },
  toggleLanguage: () => {
    set((state) => {
      const nextLang = state.language === 'en' ? 'ms' : 'en';
      localStorage.setItem('nekoku_language', nextLang);
      return { language: nextLang };
    });
  },
}));
