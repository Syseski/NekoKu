import { create } from 'zustand';
import { CatProfile, Product } from '../types';
import { api } from '../services/api';

interface CatState {
  cats: CatProfile[];
  activeCat: CatProfile | null;
  recommendations: Product[];
  isLoading: boolean;
  fetchCats: () => Promise<void>;
  setActiveCat: (cat: CatProfile | null) => void;
  fetchRecommendations: (catId: string) => Promise<void>;
  addCat: (catData: any) => Promise<CatProfile>;
  deleteCat: (catId: string) => Promise<void>;
}

export const useCatStore = create<CatState>((set, get) => ({
  cats: [],
  activeCat: null,
  recommendations: [],
  isLoading: false,

  fetchCats: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/cats');
      const rawCats: any[] = res.data.data || [];
      const cats: CatProfile[] = rawCats.map((cat) => ({
        ...cat,
        healthConcerns: cat.healthConcerns || [],
        lifeStage: cat.lifeStage || 'ADULT',
      }));
      set({ cats, isLoading: false });

      // Auto-select first cat if none active
      const currentActive = get().activeCat;
      if (!currentActive && cats.length > 0) {
        get().setActiveCat(cats[0]);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveCat: (cat) => {
    if (!cat) {
      set({ activeCat: null, recommendations: [] });
      return;
    }
    const safeCat: CatProfile = {
      ...cat,
      healthConcerns: cat.healthConcerns || [],
      lifeStage: cat.lifeStage || 'ADULT',
    };
    set({ activeCat: safeCat });
    get().fetchRecommendations(safeCat.id);
  },

  fetchRecommendations: async (catId) => {
    try {
      const res = await api.get(`/cats/${catId}/recommendations`);
      const recs = res.data.data?.recommendations || [];
      set({
        recommendations: recs.map((prod: any) => ({
          ...prod,
          healthFocuses: prod.healthFocuses || [],
          images: prod.images || [],
        })),
      });
    } catch {
      set({ recommendations: [] });
    }
  },

  addCat: async (catData) => {
    const res = await api.post('/cats', catData);
    const rawCat: any = res.data.data;
    const newCat: CatProfile = {
      ...rawCat,
      healthConcerns: rawCat.healthConcerns || [],
      lifeStage: rawCat.lifeStage || 'ADULT',
    };
    set((state) => ({
      cats: [newCat, ...state.cats.filter((c) => c.id !== newCat.id)],
      activeCat: newCat,
    }));
    try {
      await get().fetchRecommendations(newCat.id);
    } catch {
      // ignore
    }
    return newCat;
  },

  deleteCat: async (catId) => {
    await api.delete(`/cats/${catId}`);
    set((state) => {
      const remaining = state.cats.filter((c) => c.id !== catId);
      const newActive = state.activeCat?.id === catId ? (remaining[0] || null) : state.activeCat;
      return {
        cats: remaining,
        activeCat: newActive,
      };
    });
    const currentActive = get().activeCat;
    if (currentActive) {
      get().fetchRecommendations(currentActive.id);
    }
  },
}));
