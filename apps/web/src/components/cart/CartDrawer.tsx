import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../utils/translations';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { formatRM } from '../../utils/format';

interface CartDrawerProps {
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenAuth }) => {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, openCheckoutModal } = useCartStore();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  if (!isOpen) return null;

  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 50.0;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    if (!user) {
      closeCart();
      onOpenAuth();
      return;
    }
    openCheckoutModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-drawer-slide">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">{t.yourCart}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {cart?.totalItems || 0} {language === 'ms' ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-orange-50/50 border-b border-orange-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5">
              <Truck className="w-4 h-4 text-amber-600" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  {t.freeShippingAway.replace('{amount}', formatRM(remainingForFreeShipping))}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">{t.freeShippingQualified}</span>
              )}
            </div>
            <div className="w-full bg-orange-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart?.items && cart.items.length > 0 ? (
              cart.items.map((item) => {
                const imgUrl = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80';
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 shadow-xs transition"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 p-1 flex-shrink-0">
                      <img src={imgUrl} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {item.product.brand}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {item.product.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-900 font-sans">
                            {formatRM(Number(item.product.price) * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3 text-2xl">
                  🛒
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{t.cartEmpty}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.cartEmptyDesc}</p>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout Button */}
          {cart?.items && cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t.subtotal}</span>
                <span className="font-bold text-slate-900 font-sans">{formatRM(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t.shipping}</span>
                <span className="font-bold text-slate-900 font-sans">
                  {subtotal >= freeShippingThreshold ? t.free : 'RM 4.99'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>{t.totalPaid}</span>
                <span className="text-lg font-black text-amber-600 font-sans">
                  {formatRM(subtotal + (subtotal >= freeShippingThreshold ? 0 : 4.99))}
                </span>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition hover:scale-[1.01]"
              >
                <span>{t.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
