import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { CatSelector } from './CatSelector';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ShoppingBag, ShieldCheck, Heart, User, LogOut, Package, MapPin, Search, X } from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const { cart, openCart } = useCartStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const currentSearch = searchParams.get('q') || '';
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  const isAdmin = user?.role === 'ADMIN';
  const totalCartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      if (searchValue.trim()) {
        setSearchParams((prev) => {
          prev.set('q', searchValue.trim());
          return prev;
        });
      } else {
        setSearchParams((prev) => {
          prev.delete('q');
          return prev;
        });
      }
    } else {
      navigate(`/?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (location.pathname === '/') {
      setSearchParams((prev) => {
        if (val.trim()) {
          prev.set('q', val.trim());
        } else {
          prev.delete('q');
        }
        return prev;
      });
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    if (location.pathname === '/') {
      setSearchParams((prev) => {
        prev.delete('q');
        return prev;
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src="/logo.png"
              alt="NekoKu - Loves Every Meow"
              className="h-9 sm:h-12 w-auto max-w-[140px] sm:max-w-[190px] object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/logo.svg')) {
                  target.src = '/logo.svg';
                }
              }}
            />
          </Link>

          {/* Integrated Header Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-slate-100/90 hover:bg-slate-100 border border-transparent focus:border-amber-500 focus:bg-white rounded-full text-[11px] sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Language Switcher Button (EN / BM) */}
            <LanguageSwitcher />

            {/* Active Cat Profile Quick Selector (Customers only) */}
            {!isAdmin && <CatSelector />}

            {/* Admin Console shortcut for admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {t.adminConsole}
              </Link>
            )}

            {/* Cart Drawer Trigger */}
            {!isAdmin && (
              <button
                onClick={openCart}
                aria-label="Shopping Cart"
                className="relative p-2 sm:p-2.5 rounded-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-amber-600 text-white rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-center animate-bounce shadow-md shadow-amber-600/30">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Account / Auth Trigger */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-amber-500/20 transition-all duration-200 active:scale-95"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-200 shadow-xs bg-white"
                    />
                  ) : (
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                      isAdmin ? 'bg-purple-600' : 'bg-slate-900'
                    }`}>
                      {isAdmin ? '👑' : user.fullName.charAt(0)}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-100 p-2 z-50 animate-scale-in">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                          {isAdmin && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-1 space-y-0.5">
                        <Link
                          to="/account?tab=profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          {t.myAccount}
                        </Link>
                        
                        <Link
                          to="/account?tab=addresses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          {t.myAddress}
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                          {t.myOrders}
                        </Link>

                        {!isAdmin && (
                          <Link
                            to="/cats"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5 text-amber-600" />
                            {t.myCatProfiles}
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            {t.adminConsole}
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {t.signOut}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
