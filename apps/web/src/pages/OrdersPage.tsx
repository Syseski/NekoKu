import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCatStore } from '../store/catStore';
import { useCartStore } from '../store/cartStore';
import { Package, Clock, ShoppingBag, CheckCircle, RefreshCw, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRM } from '../utils/format';

export const OrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders whenever user is set
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await api.get('/orders');
        setOrders(res.data.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load orders', err);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Paid & Confirmed</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">Preparing Shipment 📦</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">On the Way 🚚</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Delivered 🎉</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-brand-500 flex items-center justify-center mx-auto shadow-md shadow-brand-500/10">
          <Package className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Sign In to View Orders</h2>
          <p className="text-xs text-slate-500 mt-1">
            Please sign in from the top navigation bar to view your store orders and receipts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-500 animate-wiggle" />
            <h1 className="text-2xl font-black text-slate-900">Order History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {user
              ? `Showing orders for ${user.fullName} (${user.email})`
              : 'Viewing simulated customer order receipts and delivery tracking.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setIsLoading(true);
              const res = await api.get('/orders');
              setOrders(res.data.data || []);
              setIsLoading(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-500' : 'text-slate-400'}`} />
            Refresh
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Shop More
          </Link>
        </div>
      </div>

      {/* Orders List View */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse h-36 space-y-3 shadow-xs">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-orange-100/70 p-6 shadow-xs space-y-4 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base font-sans">{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Total Paid</span>
                  <span className="text-xl font-black text-slate-900 font-sans">
                    {formatRM(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {order.items && order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-800 font-bold flex items-center justify-center text-[11px]">
                        {item.quantity}x
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{formatRM(item.unitPrice)} each</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 font-sans text-sm">
                      {formatRM(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Payment: <strong className="text-slate-700">{order.paymentMethod.replace(/_/g, ' ')}</strong>
                </span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Inventory Synchronized & Deducted
                </span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-orange-100 p-8 space-y-3 shadow-xs animate-scale-in">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500">
            Add specialty cat food to your cart and simulate a 1-click checkout!
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Explore Specialty Catalog
          </Link>
        </div>
      )}

    </div>
  );
};
