import React from 'react';
import { Order, OrderStatus } from '../../types';
import { formatRM } from '../../utils/format';
import { TrendingUp, ShoppingBag, Users, AlertTriangle, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AdminOverviewProps {
  overviewData: {
    kpis: {
      totalSales: number;
      todaySales: number;
      monthSales: number;
      activeOrders: number;
      totalUsers: number;
      totalProducts: number;
      lowStockCount: number;
    };
    weeklyTrend: { day: string; sales: number }[];
    recentOrders: Order[];
    categoriesDistribution: { name: string; count: number }[];
  } | null;
  onNavigateToTab: (tab: 'products' | 'orders' | 'categories' | 'users') => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminOverviewSection: React.FC<AdminOverviewProps> = ({
  overviewData,
  onNavigateToTab,
  onSelectOrder,
}) => {
  if (!overviewData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 h-28 border border-slate-100" />
        ))}
      </div>
    );
  }

  const { kpis, weeklyTrend, recentOrders, categoriesDistribution } = overviewData;
  const maxWeeklySale = Math.max(...weeklyTrend.map((d) => d.sales), 1);

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Paid</span>;
      case 'PROCESSING':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Processing</span>;
      case 'SHIPPED':
        return <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">Shipped</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Month / Today Sales */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales (This Month)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-sans">{formatRM(kpis.monthSales)}</span>
            <p className="text-xs text-slate-500 mt-1">
              Today: <strong className="text-brand-600">{formatRM(kpis.todaySales)}</strong>
            </p>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3 cursor-pointer hover:border-brand-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{kpis.activeOrders}</span>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Awaiting packing & fulfillment</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </p>
          </div>
        </div>

        {/* Card 3: Total Registered Users */}
        <div
          onClick={() => onNavigateToTab('users')}
          className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3 cursor-pointer hover:border-brand-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{kpis.totalUsers}</span>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Includes registered pet profiles</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </p>
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div
          onClick={() => onNavigateToTab('products')}
          className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3 cursor-pointer hover:border-amber-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className={`text-2xl font-black ${kpis.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {kpis.lowStockCount} Products
            </span>
            <p className="text-xs text-slate-500 mt-1">Remaining stock ≤ 10 units</p>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weekly Sales Trend (Past 7 Days)</h3>
              <p className="text-xs text-slate-400">Cat specialty nutrition & care sales performance</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">Ringgit Malaysia</span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-44">
            {weeklyTrend.map((item) => {
              const heightPercent = Math.max(15, (item.sales / maxWeeklySale) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    {formatRM(item.sales)}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-brand-500 to-amber-400 rounded-t-xl group-hover:from-brand-600 group-hover:to-amber-500 transition-all shadow-xs"
                  />
                  <span className="text-xs font-bold text-slate-600">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Product Distribution by Category</h3>
            <span className="text-xs font-bold text-slate-400">{kpis.totalProducts} Total</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoriesDistribution.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className="text-slate-500 font-bold">{cat.count} products</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (cat.count / Math.max(kpis.totalProducts, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Quick fulfillment actions for recent orders</p>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total (RM)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{order.user?.fullName || 'Customer'}</span>
                    <span className="text-[10px] text-slate-400">{order.user?.email}</span>
                  </td>
                  <td className="py-3 px-4">{order.items?.length || 0} items</td>
                  <td className="py-3 px-4 font-bold font-sans">{formatRM(order.totalAmount)}</td>
                  <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-700 font-bold text-[11px] transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
