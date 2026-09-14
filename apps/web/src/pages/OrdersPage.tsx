import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../utils/translations';
import { 
  Package, 
  Clock, 
  ShoppingBag, 
  CheckCircle, 
  RefreshCw, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  XCircle, 
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRM } from '../utils/format';

type OrderTab = 'ALL' | 'TO_PAY' | 'TO_SHIP' | 'TO_RECEIVE' | 'COMPLETED' | 'CANCELLED' | 'RETURN_REFUND';

export const OrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderTab>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const TABS: { key: OrderTab; label: string; countStatuses: OrderStatus[] }[] = [
    { key: 'ALL', label: t.tabAll, countStatuses: [] },
    { key: 'TO_PAY', label: t.tabToPay, countStatuses: ['PENDING_PAYMENT'] },
    { key: 'TO_SHIP', label: t.tabToShip, countStatuses: ['PAID', 'PROCESSING'] },
    { key: 'TO_RECEIVE', label: t.tabToReceive, countStatuses: ['SHIPPED'] },
    { key: 'COMPLETED', label: t.tabCompleted, countStatuses: ['DELIVERED'] },
    { key: 'CANCELLED', label: t.tabCancelled, countStatuses: ['CANCELLED'] },
    { key: 'RETURN_REFUND', label: t.tabReturnRefund, countStatuses: ['RETURN_REFUND'] },
  ];

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' ' + d.toLocaleTimeString(language === 'ms' ? 'ms-MY' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold flex items-center gap-1.5 border border-amber-200">
            <CreditCard className="w-3.5 h-3.5" />
            {t.tabToPay}
          </span>
        );
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center gap-1.5 border border-blue-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {language === 'ms' ? 'Dibayar & Disahkan' : 'Paid & Verified'}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold flex items-center gap-1.5 border border-orange-200">
            <Package className="w-3.5 h-3.5 animate-bounce-gentle" />
            {t.tabToShip}
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold flex items-center gap-1.5 border border-purple-200 animate-pulse">
            <Truck className="w-3.5 h-3.5" />
            {t.tabToReceive}
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {t.tabCompleted} 🎉
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            {t.tabCancelled}
          </span>
        );
      case 'RETURN_REFUND':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold flex items-center gap-1.5 border border-rose-200">
            <RotateCcw className="w-3.5 h-3.5" />
            {t.tabReturnRefund}
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">{status}</span>;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmMsg = language === 'ms'
      ? 'Adakah anda pasti mahu membatalkan pesanan ini? Stok yang ditempah akan dikembalikan.'
      : 'Are you sure you want to cancel this order? Any reserved inventory will be returned to stock.';
    if (!window.confirm(confirmMsg)) return;
    setActionLoadingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    const confirmMsg = language === 'ms'
      ? 'Adakah anda telah menerima semua barangan dalam keadaan baik?'
      : 'Have you received all items in good condition?';
    if (!window.confirm(confirmMsg)) return;
    setActionLoadingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/confirm-received`);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRequestReturnRefund = async (orderId: string) => {
    const promptMsg = language === 'ms'
      ? 'Sila nyatakan sebab permohonan pemulangan / bayaran balik anda:'
      : 'Please state the reason for your Return / Refund request:';
    const reason = window.prompt(promptMsg);
    if (!reason) return;
    setActionLoadingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/return-refund`);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBuyAgain = async (order: Order) => {
    try {
      for (const item of order.items) {
        if (item.product?.id) {
          await addItem(item.product.id, item.quantity);
        }
      }
      openCart();
    } catch (err) {
      console.error('Failed to re-add items', err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'TO_PAY') return order.status === 'PENDING_PAYMENT';
    if (activeTab === 'TO_SHIP') return order.status === 'PAID' || order.status === 'PROCESSING';
    if (activeTab === 'TO_RECEIVE') return order.status === 'SHIPPED';
    if (activeTab === 'COMPLETED') return order.status === 'DELIVERED';
    if (activeTab === 'CANCELLED') return order.status === 'CANCELLED';
    if (activeTab === 'RETURN_REFUND') return order.status === 'RETURN_REFUND';
    return true;
  });

  const getTabCount = (tab: (typeof TABS)[0]) => {
    if (tab.key === 'ALL') return orders.length;
    return orders.filter((o) => tab.countStatuses.includes(o.status)).length;
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-brand-500 flex items-center justify-center mx-auto shadow-md shadow-brand-500/10">
          <Package className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t.signInToViewOrders}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.signInOrdersDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-7 h-7 text-brand-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.ordersTitle}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.ordersDesc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-500' : 'text-slate-400'}`} />
            {t.refresh}
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t.browseCatalog}
          </Link>
        </div>
      </div>

      {/* Shopee/Lazada Style Status Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List View */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse h-40 space-y-3 shadow-xs">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const isActionBusy = actionLoadingId === order.id;
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md hover:border-amber-300 transition-all duration-300"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm font-sans tracking-tight">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t.orderedOn} {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      {t.orderTotal}
                    </span>
                    <span className="text-xl font-black text-amber-600 font-sans">
                      {formatRM(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 py-1">
                  {order.items && order.items.map((item) => {
                    const primaryImg = item.product?.images?.find((img) => img.isPrimary)?.url || item.product?.images?.[0]?.url;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          {primaryImg ? (
                            <img
                              src={primaryImg}
                              alt={item.productName}
                              className="w-14 h-14 rounded-2xl object-contain border border-slate-100 bg-white p-1 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-500 font-bold flex-shrink-0">
                              🐱
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">{item.productName}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-slate-500">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                {language === 'ms' ? 'Kuantiti' : 'Qty'}: {item.quantity}
                              </span>
                              <span>•</span>
                              <span>{formatRM(item.unitPrice)} / unit</span>
                            </div>
                          </div>
                        </div>

                        <span className="font-bold text-slate-900 font-sans text-sm">
                          {formatRM(item.totalPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Address & Metadata */}
                {order.deliveryAddress && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">{order.deliveryAddress.recipientName}</span>{' '}
                      ({order.deliveryAddress.phone}) —{' '}
                      <span>{order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}, {order.deliveryAddress.state || ''} {order.deliveryAddress.postalCode}</span>
                    </div>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{t.payment}: <strong className="text-slate-700">{order.paymentMethod.replace(/_/g, ' ')}</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    {(order.status === 'PENDING_PAYMENT' || order.status === 'PAID' || order.status === 'PROCESSING') && (
                      <button
                        disabled={isActionBusy}
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isActionBusy ? '...' : t.cancelOrder}
                      </button>
                    )}

                    {order.status === 'SHIPPED' && (
                      <>
                        <button
                          disabled={isActionBusy}
                          onClick={() => handleRequestReturnRefund(order.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {t.requestReturnRefund}
                        </button>
                        <button
                          disabled={isActionBusy}
                          onClick={() => handleConfirmReceived(order.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isActionBusy ? '...' : t.confirmReceived}
                        </button>
                      </>
                    )}

                    {order.status === 'DELIVERED' && (
                      <>
                        <button
                          disabled={isActionBusy}
                          onClick={() => handleRequestReturnRefund(order.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {t.returnRefundBtn}
                        </button>
                        <button
                          onClick={() => handleBuyAgain(order)}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          {t.buyAgain}
                        </button>
                      </>
                    )}

                    {(order.status === 'CANCELLED' || order.status === 'RETURN_REFUND') && (
                      <button
                        onClick={() => handleBuyAgain(order)}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {t.buyAgain}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3 shadow-xs animate-scale-in">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'ALL' ? t.noOrdersYet : t.noOrdersInTab.replace('{tab}', TABS.find(t => t.key === activeTab)?.label || '')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.noOrdersDesc}
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            {t.browseCatalog}
          </Link>
        </div>
      )}

    </div>
  );
};
