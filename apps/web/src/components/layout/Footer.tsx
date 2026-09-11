import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-orange-100 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="NekoKu - Loves Every Meow"
              className="h-12 sm:h-14 w-auto max-w-[210px] object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/logo.svg')) {
                  target.src = '/logo.svg';
                }
              }}
            />
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <span>Clinical Nutrition</span>
            <span>Life Stage Diets</span>
            <span>Tofu Litter</span>
            <span>Phase 2: Mobile App Ready</span>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} NekoKu Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
