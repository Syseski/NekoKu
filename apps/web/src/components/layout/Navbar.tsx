import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { CatSelector } from './CatSelector';
import { ShoppingBag, ShieldCheck, Heart, User, LogOut, Package, MapPin, Settings } from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { cart, openCart } = useCartStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const totalCartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-orange-100 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src="/logo.png"
              alt="NekoKu - Loves Every Meow"
              className="h-12 sm:h-13 w-auto max-w-[200px] object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/logo.svg')) {
                  target.src = '/logo.svg';
                }
              }}
            />
          </Link>

          {/* Navigation Links */}
          {isAdmin && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <Link
                to="/admin"
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-105'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-105 border border-purple-200/80'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            </nav>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            
            {/* Active Cat Profile Quick Selector (Customers only) */}
            {!isAdmin && <CatSelector />}

            {/* Cart Drawer Trigger - Only for customers / visitors, hidden for admin */}
            {!isAdmin && (
              <button
                onClick={openCart}
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs"
              >
                <ShoppingBag className="w-5 h-5 text-slate-800" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white rounded-full text-[11px] font-black flex items-center justify-center animate-bounce shadow-md shadow-brand-500/30">
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
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all duration-200 active:scale-95"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-brand-200 shadow-xs"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ${
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
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 rounded-xl transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-brand-500" />
                          My Account / Profile
                        </Link>
                        
                        <Link
                          to="/account?tab=addresses"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 rounded-xl transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-brand-500" />
                          My Address
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 rounded-xl transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-brand-500" />
                          My Orders
                        </Link>

                        {!isAdmin && (
                          <Link
                            to="/cats"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-brand-600 rounded-xl transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5 text-brand-500" />
                            My Cat Profiles
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            Admin Console
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
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
