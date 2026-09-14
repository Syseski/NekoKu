import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCatStore } from '../../store/catStore';
import { useCartStore } from '../../store/cartStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { X, ShieldCheck, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuthStore();
  const { fetchCats } = useCatStore();
  const { fetchCart } = useCartStore();
  const { language } = useLanguageStore();
  const currentT = translations[language] || translations.en;

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      if (isRegister) {
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
      await Promise.all([fetchCats(), fetchCart()]);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setEmail('admin@nekoku.my');
    setPassword('admin12345');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 p-6 space-y-5 my-auto animate-scale-in"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isRegister ? currentT.joinNekoKu : currentT.signInNekoKu}
              </h3>
              <p className="text-xs text-slate-500">{currentT.specialtySubtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Quick Fill Pill */}
        {!isRegister && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-xs">
            <div className="flex items-center gap-2 text-purple-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>{currentT.adminAccountAvailable}</span>
            </div>
            <button
              type="button"
              onClick={handleAdminQuickFill}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition"
            >
              {currentT.fillAdminInfo}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Custom Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{currentT.fullName}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{currentT.emailAddress}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@nekoku.my"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{currentT.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {isLoading ? currentT.signingIn : isRegister ? currentT.createAccount : currentT.signIn}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-brand-600 hover:underline font-semibold"
          >
            {isRegister
              ? currentT.alreadyHaveAccount
              : currentT.dontHaveAccount}
          </button>
        </div>

      </div>
    </div>
  );
};
